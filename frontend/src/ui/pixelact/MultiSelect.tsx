import {useState, useRef, useEffect} from 'react';
import {CheckIcon, ChevronDownIcon} from 'lucide-react';
import {cn} from '@lib/utils';

type MultiSelectProps = {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  counts?: Record<string, number>;
};

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'All types',
  className,
  counts,
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
          'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-none border-0 select-none shadow-[var(--pixel-box-shadow)]'
        )}
        style={{backgroundColor: 'var(--input)', color: 'var(--foreground)'}}
      >
        <span
          className="pixel-font text-sm"
          style={{color: 'var(--foreground)'}}
        >
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDownIcon className="size-4 opacity-50" />
      </button>

      {open && (
        <div
          className="absolute z-10 left-0 right-0 top-full mt-1 w-full rounded-none border-none shadow-[var(--pixel-box-shadow)] max-h-[160px] overflow-y-auto"
          style={{
            backgroundColor: 'var(--popover)',
            color: 'var(--popover-foreground)',
          }}
          role="listbox"
        >
          {/* Clear all option */}
          <button
            type="button"
            onClick={() => {
              if (selected.length > 0) {
                onChange([]);
              }
            }}
            disabled={selected.length === 0}
            className="w-full flex items-center px-3 py-2 text-sm border-y-3 border-dashed border-ring/0 outline-none"
            style={{
              cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selected.length === 0 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (selected.length > 0) {
                e.currentTarget.style.backgroundColor = 'var(--accent)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <span
              className="pixel-font font-bold"
              style={{color: 'var(--foreground)'}}
            >
              Clear all types
            </span>
          </button>

          {options.map((type) => {
            const count = counts?.[type];
            const displayText =
              count !== undefined ? `${type} (${count})` : type;

            return (
              <label
                key={type}
                className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer border-y-3 border-dashed border-ring/0 hover:border-foreground dark:hover:border-ring outline-none"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent)';
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
                    className="appearance-none w-4 h-4 border rounded-sm"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--input)',
                    }}
                  />
                  <span
                    className="capitalize pixel-font"
                    style={{color: 'var(--foreground)'}}
                  >
                    {displayText}
                  </span>
                </div>
                {selected.includes(type) && (
                  <CheckIcon className="size-4 opacity-70" />
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
