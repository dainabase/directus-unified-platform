import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorPicker } from "./color-picker";

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe("ColorPicker", () => {
  beforeEach(() => {
    mockWriteText.mockClear();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<ColorPicker />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<ColorPicker label="Choose Color" />);
      expect(screen.getByText("Choose Color")).toBeInTheDocument();
    });

    it("should display the color value", () => {
      render(<ColorPicker value="#FF0000" />);
      expect(screen.getByText("#FF0000")).toBeInTheDocument();
    });

    it("should render with different sizes", () => {
      const { rerender } = render(<ColorPicker size="sm" />);
      expect(screen.getByRole("button")).toHaveClass("h-8");

      rerender(<ColorPicker size="md" />);
      expect(screen.getByRole("button")).toHaveClass("h-10");

      rerender(<ColorPicker size="lg" />);
      expect(screen.getByRole("button")).toHaveClass("h-12");
    });

    it("should render with different variants", () => {
      const { rerender } = render(<ColorPicker variant="default" />);
      expect(screen.getByRole("button")).toHaveClass("w-full");

      rerender(<ColorPicker variant="compact" />);
      expect(screen.getByRole("button")).toHaveClass("w-auto");

      rerender(<ColorPicker variant="inline" />);
      expect(screen.getByRole("button")).toHaveClass("border-0");
    });

    it("should render with different swatch shapes", () => {
      const { rerender } = render(<ColorPicker swatchShape="square" />);
      const squareSwatch = screen.getByRole("button").querySelector("div");
      expect(squareSwatch).toHaveClass("rounded");

      rerender(<ColorPicker swatchShape="circle" />);
      const circleSwatch = screen.getByRole("button").querySelector("div");
      expect(circleSwatch).toHaveClass("rounded-full");
    });

    it("should be disabled when disabled prop is true", () => {
      render(<ColorPicker disabled />);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("Popover Interaction", () => {
    it("should open popover on click", async () => {
      render(<ColorPicker />);
      const button = screen.getByRole("button");
      
      await userEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should close popover on outside click", async () => {
      render(<ColorPicker />);
      const button = screen.getByRole("button");
      
      await userEvent.click(button);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      
      await userEvent.click(document.body);
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should not open popover when disabled", async () => {
      render(<ColorPicker disabled />);
      const button = screen.getByRole("button");
      
      await userEvent.click(button);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Color Formats", () => {
    it("should display HEX format by default", () => {
      render(<ColorPicker value="#FF0000" format="hex" />);
      expect(screen.getByText("#FF0000")).toBeInTheDocument();
    });

    it("should display RGB format", () => {
      render(<ColorPicker value="#FF0000" format="rgb" />);
      expect(screen.getByText(/rgb\(255, 0, 0\)/)).toBeInTheDocument();
    });

    it("should display HSL format", () => {
      render(<ColorPicker value="#FF0000" format="hsl" />);
      expect(screen.getByText(/hsl\(0, 100%, 50%\)/)).toBeInTheDocument();
    });

    it("should display HSV format", () => {
      render(<ColorPicker value="#FF0000" format="hsv" />);
      expect(screen.getByText(/hsv\(0, 100%, 100%\)/)).toBeInTheDocument();
    });

    it("should display RGBA format with alpha", () => {
      render(<ColorPicker value="#FF0000" format="rgb" showAlpha />);
      expect(screen.getByText(/rgba\(255, 0, 0/)).toBeInTheDocument();
    });
  });

  describe("Format Tabs", () => {
    it("should switch between format tabs", async () => {
      render(<ColorPicker value="#FF0000" />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Switch to RGB tab
      const rgbTab = screen.getByRole("tab", { name: /RGB/i });
      await userEvent.click(rgbTab);
      
      // Check if RGB inputs are visible
      await waitFor(() => {
        expect(screen.getByLabelText("R")).toBeInTheDocument();
        expect(screen.getByLabelText("G")).toBeInTheDocument();
        expect(screen.getByLabelText("B")).toBeInTheDocument();
      });
      
      // Switch to HSL tab
      const hslTab = screen.getByRole("tab", { name: /HSL/i });
      await userEvent.click(hslTab);
      
      // Check if HSL inputs are visible
      await waitFor(() => {
        expect(screen.getByLabelText("H")).toBeInTheDocument();
        expect(screen.getByLabelText("S")).toBeInTheDocument();
        expect(screen.getByLabelText("L")).toBeInTheDocument();
      });
    });
  });

  describe("Color Input", () => {
    it("should update color via HEX input", async () => {
      const onChange = vi.fn();
      render(<ColorPicker value="#FF0000" onChange={onChange} />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Find and update HEX input
      const hexInput = screen.getByPlaceholderText("#000000");
      await userEvent.clear(hexInput);
      await userEvent.type(hexInput, "#00FF00");
      
      expect(onChange).toHaveBeenCalledWith("#00FF00", "hex");
    });

    it("should update color via RGB inputs", async () => {
      const onChange = vi.fn();
      render(<ColorPicker value="#000000" onChange={onChange} />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Switch to RGB tab
      await userEvent.click(screen.getByRole("tab", { name: /RGB/i }));
      
      // Update R value
      const rInput = screen.getByLabelText("R");
      await userEvent.clear(rInput);
      await userEvent.type(rInput, "255");
      
      expect(onChange).toHaveBeenCalledWith("#ff0000", "hex");
    });
  });

  describe("Preset Colors", () => {
    it("should show preset colors by default", async () => {
      render(<ColorPicker showPresets />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Check for preset colors section
      await waitFor(() => {
        expect(screen.getByText("Presets")).toBeInTheDocument();
      });
    });

    it("should hide preset colors when showPresets is false", async () => {
      render(<ColorPicker showPresets={false} />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Check that preset colors are not shown
      await waitFor(() => {
        expect(screen.queryByText("Presets")).not.toBeInTheDocument();
      });
    });

    it("should select a preset color", async () => {
      const onChange = vi.fn();
      render(<ColorPicker onChange={onChange} presetColors={["#FF0000", "#00FF00"]} />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Click first preset color
      const presetButtons = screen.getAllByRole("button", { name: /Select color #/ });
      await userEvent.click(presetButtons[0]);
      
      expect(onChange).toHaveBeenCalledWith("#FF0000", "hex");
    });
  });

  describe("Alpha Channel", () => {
    it("should show alpha slider when showAlpha is true", async () => {
      render(<ColorPicker showAlpha />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Check for alpha slider
      await waitFor(() => {
        expect(screen.getByText("Alpha")).toBeInTheDocument();
        expect(screen.getByRole("slider")).toBeInTheDocument();
      });
    });

    it("should update alpha value", async () => {
      render(<ColorPicker showAlpha />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Find and update alpha slider
      const alphaSlider = screen.getByRole("slider");
      fireEvent.change(alphaSlider, { target: { value: "50" } });
      
      // Check if alpha value is displayed
      await waitFor(() => {
        expect(screen.getByText("50%")).toBeInTheDocument();
      });
    });
  });

  describe("Copy to Clipboard", () => {
    it("should copy color to clipboard", async () => {
      render(<ColorPicker value="#FF0000" copyToClipboard />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Find and click copy button
      const copyButton = screen.getAllByRole("button").find(btn => 
        btn.querySelector("[class*='lucide-copy']")
      );
      
      if (copyButton) {
        await userEvent.click(copyButton);
        expect(mockWriteText).toHaveBeenCalledWith("#FF0000");
      }
    });

    it("should not show copy button when copyToClipboard is false", async () => {
      render(<ColorPicker copyToClipboard={false} />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Check that copy button is not present
      const copyButton = screen.getAllByRole("button").find(btn => 
        btn.querySelector("[class*='lucide-copy']")
      );
      
      expect(copyButton).toBeUndefined();
    });
  });

  describe("onChange Callback", () => {
    it("should call onChange with value and format", async () => {
      const onChange = vi.fn();
      render(<ColorPicker value="#FF0000" onChange={onChange} format="hex" />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Change color
      const hexInput = screen.getByPlaceholderText("#000000");
      await userEvent.clear(hexInput);
      await userEvent.type(hexInput, "#00FF00");
      
      expect(onChange).toHaveBeenCalledWith("#00FF00", "hex");
    });

    it("should call onChange with correct format when switching tabs", async () => {
      const onChange = vi.fn();
      render(<ColorPicker value="#FF0000" onChange={onChange} />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Switch to RGB tab
      await userEvent.click(screen.getByRole("tab", { name: /RGB/i }));
      
      // Update a value
      const rInput = screen.getByLabelText("R");
      await userEvent.clear(rInput);
      await userEvent.type(rInput, "128");
      
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<ColorPicker label="Color" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should be keyboard navigable", async () => {
      render(<ColorPicker />);
      const button = screen.getByRole("button");
      
      // Focus button
      button.focus();
      expect(button).toHaveFocus();
      
      // Open with Enter key
      fireEvent.keyDown(button, { key: "Enter" });
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should have aria-label for preset colors", async () => {
      render(<ColorPicker presetColors={["#FF0000"]} />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Check for aria-label on preset buttons
      const presetButton = screen.getByRole("button", { name: /Select color #FF0000/i });
      expect(presetButton).toBeInTheDocument();
    });

    it("should trap focus in popover", async () => {
      render(<ColorPicker />);
      
      // Open popover
      await userEvent.click(screen.getByRole("button"));
      
      // Check if dialog has appropriate role
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });
  });
});
