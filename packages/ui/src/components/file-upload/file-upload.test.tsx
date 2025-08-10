import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload, FileItem } from "./file-upload";

describe("FileUpload", () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<FileUpload />);
      expect(screen.getByText("Upload files")).toBeInTheDocument();
      expect(screen.getByText(/Drag and drop/)).toBeInTheDocument();
    });

    it("should render with custom label and description", () => {
      render(
        <FileUpload 
          label="Custom Label" 
          description="Custom Description" 
        />
      );
      expect(screen.getByText("Custom Label")).toBeInTheDocument();
      expect(screen.getByText("Custom Description")).toBeInTheDocument();
    });

    it("should render different variants", () => {
      const { rerender } = render(<FileUpload variant="default" />);
      expect(screen.getByText("Browse Files")).toBeInTheDocument();

      rerender(<FileUpload variant="compact" label="Upload" />);
      expect(screen.getByRole("button", { name: /Upload/i })).toBeInTheDocument();

      rerender(<FileUpload variant="card" />);
      expect(screen.getByText("Upload files")).toBeInTheDocument();
    });

    it("should show accept types when specified", () => {
      render(<FileUpload accept="image/*,.pdf" variant="default" />);
      expect(screen.getByText(/Accepted: image\/\*,\.pdf/)).toBeInTheDocument();
    });

    it("should show max size when specified", () => {
      render(<FileUpload maxSize={5242880} variant="default" />);
      expect(screen.getByText(/Max size: 5 MB/)).toBeInTheDocument();
    });

    it("should be disabled when disabled prop is true", () => {
      render(<FileUpload disabled variant="compact" />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("File Input", () => {
    it("should have hidden file input", () => {
      render(<FileUpload />);
      const fileInput = screen.getByLabelText("Upload files");
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveClass("hidden");
    });

    it("should set accept attribute on file input", () => {
      render(<FileUpload accept="image/*" />);
      const fileInput = screen.getByLabelText("Upload files");
      expect(fileInput).toHaveAttribute("accept", "image/*");
    });

    it("should set multiple attribute based on prop", () => {
      const { rerender } = render(<FileUpload multiple={true} />);
      let fileInput = screen.getByLabelText("Upload files");
      expect(fileInput).toHaveAttribute("multiple");

      rerender(<FileUpload multiple={false} />);
      fileInput = screen.getByLabelText("Upload files");
      expect(fileInput).not.toHaveAttribute("multiple");
    });

    it("should trigger file input on click", async () => {
      render(<FileUpload variant="compact" />);
      const fileInput = screen.getByLabelText("Upload files") as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, "click");
      
      const button = screen.getByRole("button");
      await userEvent.click(button);
      
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("File Selection", () => {
    it("should handle file selection", async () => {
      const onChange = vi.fn();
      render(<FileUpload onChange={onChange} />);
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              file: file,
              status: "idle",
              progress: 0,
            })
          ])
        );
      });
    });

    it("should handle multiple file selection", async () => {
      const onChange = vi.fn();
      render(<FileUpload multiple onChange={onChange} />);
      
      const files = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
      ];
      
      const fileInput = screen.getByLabelText("Upload files");
      Object.defineProperty(fileInput, "files", {
        value: files,
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ file: files[0] }),
            expect.objectContaining({ file: files[1] }),
          ])
        );
      });
    });

    it("should reject multiple files when multiple is false", async () => {
      const onError = vi.fn();
      render(<FileUpload multiple={false} onError={onError} />);
      
      const files = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
      ];
      
      const fileInput = screen.getByLabelText("Upload files");
      Object.defineProperty(fileInput, "files", {
        value: files,
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("Multiple files not allowed");
      });
    });
  });

  describe("File Validation", () => {
    it("should validate file size - max size", async () => {
      const onChange = vi.fn();
      render(<FileUpload maxSize={1024} onChange={onChange} />);
      
      const largeFile = new File(["x".repeat(2048)], "large.txt", { type: "text/plain" });
      Object.defineProperty(largeFile, "size", { value: 2048, writable: false });
      
      const fileInput = screen.getByLabelText("Upload files");
      Object.defineProperty(fileInput, "files", {
        value: [largeFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              status: "error",
              error: expect.stringContaining("exceeds"),
            })
          ])
        );
      });
    });

    it("should validate file size - min size", async () => {
      const onChange = vi.fn();
      render(<FileUpload minSize={1024} onChange={onChange} />);
      
      const smallFile = new File(["x"], "small.txt", { type: "text/plain" });
      Object.defineProperty(smallFile, "size", { value: 1, writable: false });
      
      const fileInput = screen.getByLabelText("Upload files");
      Object.defineProperty(fileInput, "files", {
        value: [smallFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              status: "error",
              error: expect.stringContaining("below"),
            })
          ])
        );
      });
    });

    it("should validate file type", async () => {
      const onChange = vi.fn();
      render(<FileUpload accept="image/*" onChange={onChange} />);
      
      const textFile = new File(["content"], "test.txt", { type: "text/plain" });
      
      const fileInput = screen.getByLabelText("Upload files");
      Object.defineProperty(fileInput, "files", {
        value: [textFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              status: "error",
              error: expect.stringContaining("not accepted"),
            })
          ])
        );
      });
    });

    it("should use custom validation", async () => {
      const validateFile = vi.fn().mockReturnValue("Custom error");
      const onChange = vi.fn();
      
      render(
        <FileUpload 
          validateFile={validateFile} 
          onChange={onChange} 
        />
      );
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(validateFile).toHaveBeenCalledWith(file);
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              status: "error",
              error: "Custom error",
            })
          ])
        );
      });
    });

    it("should check max files limit", async () => {
      const onError = vi.fn();
      render(
        <FileUpload 
          multiple 
          maxFiles={2} 
          onError={onError} 
        />
      );
      
      const files = [
        new File(["1"], "file1.txt", { type: "text/plain" }),
        new File(["2"], "file2.txt", { type: "text/plain" }),
        new File(["3"], "file3.txt", { type: "text/plain" }),
      ];
      
      const fileInput = screen.getByLabelText("Upload files");
      Object.defineProperty(fileInput, "files", {
        value: files,
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("Maximum 2 files allowed");
      });
    });
  });

  describe("Drag and Drop", () => {
    it("should handle drag enter", () => {
      render(<FileUpload />);
      const dropZone = screen.getByText(/Drag and drop/).parentElement?.parentElement;
      
      if (dropZone) {
        fireEvent.dragEnter(dropZone);
        expect(dropZone).toHaveClass("border-primary");
      }
    });

    it("should handle drag leave", () => {
      render(<FileUpload />);
      const dropZone = screen.getByText(/Drag and drop/).parentElement?.parentElement;
      
      if (dropZone) {
        fireEvent.dragEnter(dropZone);
        fireEvent.dragLeave(dropZone);
        expect(dropZone).not.toHaveClass("border-primary");
      }
    });

    it("should handle file drop", async () => {
      const onChange = vi.fn();
      render(<FileUpload onChange={onChange} />);
      
      const dropZone = screen.getByText(/Drag and drop/).parentElement?.parentElement;
      const file = new File(["content"], "dropped.txt", { type: "text/plain" });
      
      if (dropZone) {
        const dataTransfer = {
          files: [file],
          items: [],
          types: ["Files"],
        };
        
        fireEvent.drop(dropZone, { dataTransfer });
        
        await waitFor(() => {
          expect(onChange).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                file: file,
                status: "idle",
              })
            ])
          );
        });
      }
    });

    it("should not handle drop when disabled", () => {
      const onChange = vi.fn();
      render(<FileUpload disabled onChange={onChange} />);
      
      const dropZone = screen.getByText(/Drag and drop/).parentElement?.parentElement;
      const file = new File(["content"], "dropped.txt", { type: "text/plain" });
      
      if (dropZone) {
        const dataTransfer = {
          files: [file],
          items: [],
          types: ["Files"],
        };
        
        fireEvent.drop(dropZone, { dataTransfer });
        
        expect(onChange).not.toHaveBeenCalled();
      }
    });
  });

  describe("File List Display", () => {
    it("should show file list when showFileList is true", async () => {
      render(<FileUpload showFileList={true} />);
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(screen.getByText("test.txt")).toBeInTheDocument();
      });
    });

    it("should not show file list when showFileList is false", async () => {
      render(<FileUpload showFileList={false} />);
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(screen.queryByText("test.txt")).not.toBeInTheDocument();
      });
    });

    it("should show file size", async () => {
      render(<FileUpload />);
      
      const file = new File(["x".repeat(1024)], "test.txt", { type: "text/plain" });
      Object.defineProperty(file, "size", { value: 1024, writable: false });
      
      const fileInput = screen.getByLabelText("Upload files");
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(screen.getByText(/1 KB/)).toBeInTheDocument();
      });
    });
  });

  describe("File Actions", () => {
    it("should remove file when remove button clicked", async () => {
      const onRemove = vi.fn();
      render(<FileUpload allowRemove={true} onRemove={onRemove} />);
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(screen.getByText("test.txt")).toBeInTheDocument();
      });
      
      const removeButton = screen.getByRole("button", { name: "" }).parentElement?.querySelector("button:last-child");
      if (removeButton) {
        await userEvent.click(removeButton);
        
        await waitFor(() => {
          expect(onRemove).toHaveBeenCalled();
          expect(screen.queryByText("test.txt")).not.toBeInTheDocument();
        });
      }
    });

    it("should not show remove button when allowRemove is false", async () => {
      render(<FileUpload allowRemove={false} />);
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        // Should only have the main upload button, not remove buttons
        expect(buttons.length).toBeLessThan(3);
      });
    });
  });

  describe("Upload Functionality", () => {
    it("should auto upload when autoUpload is true", async () => {
      const onUpload = vi.fn().mockResolvedValue(undefined);
      render(<FileUpload autoUpload={true} onUpload={onUpload} />);
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              file: file,
              status: "idle",
            })
          ])
        );
      });
    });

    it("should show upload button when autoUpload is false", async () => {
      const onUpload = vi.fn();
      render(<FileUpload autoUpload={false} onUpload={onUpload} />);
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(screen.getByText(/Upload 1 file/)).toBeInTheDocument();
      });
      
      expect(onUpload).not.toHaveBeenCalled();
    });

    it("should handle upload error", async () => {
      const onError = vi.fn();
      const onUpload = vi.fn().mockRejectedValue(new Error("Upload failed"));
      
      render(
        <FileUpload 
          autoUpload={true} 
          onUpload={onUpload} 
          onError={onError} 
        />
      );
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("Upload failed");
      });
    });
  });

  describe("Progress Display", () => {
    it("should show progress when showProgress is true", async () => {
      render(<FileUpload showProgress={true} />);
      
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const fileInput = screen.getByLabelText("Upload files");
      
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Would need to trigger upload and check for progress bar
      // This would require more complex mocking of the upload process
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<FileUpload label="Upload documents" />);
      const fileInput = screen.getByLabelText("Upload documents");
      expect(fileInput).toBeInTheDocument();
    });

    it("should be keyboard accessible", async () => {
      render(<FileUpload variant="compact" />);
      const button = screen.getByRole("button");
      
      button.focus();
      expect(button).toHaveFocus();
      
      // Simulate Enter key press
      fireEvent.keyDown(button, { key: "Enter" });
      // Would trigger file input click
    });
  });
});
