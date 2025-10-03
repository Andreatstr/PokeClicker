import { useState, useRef, useEffect } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type MultiSelectProps = {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "All types",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleOption = (type: string) => {
    if (selected.includes(type)) {
      onChange(selected.filter(t => t !== type))
    } else {
      onChange([...selected, type])
    }
  }

  return (
    <div className={cn("relative w-[220px] box-shadow-margin", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-none border-0 select-none shadow-[var(--pixel-box-shadow)]",
          "bg-[var(--retro-surface)] text-black dark:text-black"
        )}
      >
        <span className="pixel-font text-black dark:text-black text-sm">
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDownIcon className="size-4 opacity-50" />
      </button>

      {open && (
        <div
          className="absolute z-10 mt-2 w-full rounded-none border-none shadow-[var(--pixel-box-shadow)] bg-[var(--retro-surface)] text-black dark:text-black max-h-60 overflow-y-auto"
        >
          {options.map(type => (
            <label
              key={type}
              className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer border-y-3 border-dashed border-ring/0 hover:border-foreground dark:hover:border-ring"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--retro-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ''
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(type)}
                onChange={() => toggleOption(type)}
              />
              <span className="capitalize">{type}</span>
              {selected.includes(type) && <CheckIcon className="size-4 ml-auto opacity-70" />}
            </label>
          ))}
        </div>
      )}
    </div>

  )
}
