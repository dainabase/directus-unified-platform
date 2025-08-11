import * as React from "react"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

const DrawerContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
  position: "left" | "right" | "top" | "bottom"
}>({
  open: false,
  onOpenChange: () => {},
  position: "right",
})

export interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  position?: "left" | "right" | "top" | "bottom"
  children?: React.ReactNode
}

export function Drawer({
  open = false,
  onOpenChange,
  position = "right",
  children,
}: DrawerProps) {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    },
    [onOpenChange]
  )

  return (
    <DrawerContext.Provider
      value={{ open: isOpen, onOpenChange: handleOpenChange, position }}
    >
      {children}
    </DrawerContext.Provider>
  )
}

export interface DrawerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DrawerTrigger = React.forwardRef<
  HTMLButtonElement,
  DrawerTriggerProps
>(({ onClick, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DrawerContext)

  return (
    <button
      ref={ref}
      onClick={(e) => {
        onClick?.(e)
        onOpenChange(true)
      }}
      {...props}
    />
  )
})
DrawerTrigger.displayName = "DrawerTrigger"

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
}

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const { open, onOpenChange, position } = React.useContext(DrawerContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  const positionClasses = {
    left: "left-0 top-0 h-full w-80 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
    right: "right-0 top-0 h-full w-80 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    top: "top-0 left-0 w-full h-80 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
    bottom: "bottom-0 left-0 w-full h-80 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        onClick={() => onOpenChange(false)}
        data-state={open ? "open" : "closed"}
      />
      
      {/* Drawer */}
      <div
        ref={ref || contentRef}
        className={cn(
          "fixed z-50 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          positionClasses[position],
          className
        )}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {showCloseButton && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
        {children}
      </div>
    </>
  )
})
DrawerContent.displayName = "DrawerContent"

export const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

export const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerDescription"