import { useRef } from "react";

type Props={
    placeholder?:string
    value?: string
    onChange?: (value: string) => void
    className?: string
}

const SearchBar=({placeholder="Search ...", value = "", onChange, className = ""}: Props)=>{
    const inputRef = useRef<HTMLInputElement | null>(null);
    const showClear = value.trim().length > 0;

    return(
        <div className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                className="w-full rounded border border-gray-200 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {showClear && (
                <button
                    type="button"
                    onClick={() => {
                        onChange?.("");
                        // Keep UX smooth: clear + keep focus in the same field.
                        requestAnimationFrame(() => inputRef.current?.focus());
                    }}
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Clear search"
                    title="Clear"
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                        <path
                            d="M18 6 6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
        </div>
    )
}
export default SearchBar
