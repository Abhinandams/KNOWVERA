type Props={
    placeholder?:string
    value?: string
    onChange?: (value: string) => void
}

const SearchBar=({placeholder="Search ...", value = "", onChange}: Props)=>{
    return(
        <div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                className="w-full border rounded-lg px-4 py-2"
            />
        </div>
    )
}
export default SearchBar
