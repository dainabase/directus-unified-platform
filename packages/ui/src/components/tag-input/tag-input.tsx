import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Badge } from "../badge/badge"

export interface TagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  allowDuplicates?: boolean
  delimiter?: string
  variant?: "default" | "destructive" | "outline" | "secondary"
  className?: string
  tagClassName?: string
  onTagAdd?: (tag: string) => void
  onTagRemove?: (tag: string) => void
  validateTag?: (tag: string) => boolean
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({
    value = [],
    onChange,
    placeholder = "Add tags...",
    maxTags,
    allowDuplicates = false,
    delimiter = ",",
    variant = "secondary",
    className,
    tagClassName,
    onTagAdd,
    onTagRemove,
    validateTag,
    disabled,
    ...props
  }, ref) => {
    const [inputValue, setInputValue] = React.useState("")
    const [tags, setTags] = React.useState<string[]>(value)
    const [error, setError] = React.useState<string | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setTags(value)
    }, [value])

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim()
      
      if (!trimmedTag) return
      
      if (maxTags && tags.length >= maxTags) {
        setError(`Maximum ${maxTags} tags allowed`)
        return
      }
      
      if (!allowDuplicates && tags.includes(trimmedTag)) {
        setError("Tag already exists")
        return
      }
      
      if (validateTag && !validateTag(trimmedTag)) {
        setError("Invalid tag")
        return
      }
      
      const newTags = [...tags, trimmedTag]
      setTags(newTags)
      onChange?.(newTags)
      onTagAdd?.(trimmedTag)
      setInputValue("")
      setError(null)
    }

    const removeTag = (indexToRemove: number) => {
      const removedTag = tags[indexToRemove]
      const newTags = tags.filter((_, index) => index !== indexToRemove)
      setTags(newTags)
      onChange?.(newTags)
      onTagRemove?.(removedTag)
      setError(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === delimiter) {
        e.preventDefault()
        addTag(inputValue)
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1)
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const paste = e.clipboardData.getData("text")
      const tagsToAdd = paste.split(delimiter).map(t => t.trim()).filter(Boolean)
      
      tagsToAdd.forEach(tag => {
        if (!maxTags || tags.length < maxTags) {
          addTag(tag)
        }
      })
    }

    return (
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            "flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant={variant}
              className={cn(
                "gap-1 pr-1.5",
                disabled && "opacity-50",
                tagClassName
              )}
            >
              <span className="text-xs">{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTag(index)
                  }}
                  className={cn(
                    "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    disabled && "pointer-events-none"
                  )}
                  disabled={disabled}
                >
                  <X className="h-3 w-3 hover:opacity-75" />
                </button>
              )}
            </Badge>
          ))}
          <input
            ref={ref || inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => {
              if (inputValue) {
                addTag(inputValue)
              }
            }}
            disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
            placeholder={
              maxTags && tags.length >= maxTags
                ? `Maximum ${maxTags} tags reached`
                : placeholder
            }
            className={cn(
              "flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]",
              disabled && "cursor-not-allowed"
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

TagInput.displayName = "TagInput"

export { TagInput }
