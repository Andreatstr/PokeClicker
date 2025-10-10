import {useState, useRef, useEffect} from 'react';
import {CheckIcon, ChevronDownIcon} from 'lucide-react';
import {cn} from '@/lib/utils';

type MultiSelectProps = {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'All types',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (type: string) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div
      className={cn('relative w-[220px] box-shadow-margin', className)}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-none border-0 select-none shadow-[var(--pixel-box-shadow)]',
          'bg-[var(--retro-surface)] text-black dark:text-black'
        )}
      >
        <span className="pixel-font text-black dark:text-black text-sm">
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDownIcon className="size-4 opacity-50" />
      </button>

      {open && (
        <div
          className="absolute z-10 left-0 right-0 top-full mt-1 w-full rounded-none border-none shadow-[var(--pixel-box-shadow)] bg-[var(--retro-surface)] text-black dark:text-black max-h-[160px] overflow-y-auto"
          role="listbox"
        >
          {options.map((type) => (
            <label
              key={type}
              className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer border-y-3 border-dashed border-ring/0 hover:border-foreground dark:hover:border-ring outline-none"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--retro-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(type)}
                  onChange={() => toggleOption(type)}
                  className="appearance-none w-4 h-4 border border-black rounded-sm checked:bg-black checked:border-black"
                />
                <span className="capitalize text-black pixel-font">{type}</span>
              </div>
              {selected.includes(type) && (
                <CheckIcon className="size-4 opacity-70" />
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
