type Props={
    options:string[]
    value?: string
    onChange?: (value: string) => void
}
const FilterDropdown=({options, value, onChange}:Props)=>{
    return (
        <select
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            className="border rounded-lg px-3 py-2 bg-white"
        >
            {options.map((opt,index)=>(
                <option key={index}>{opt}</option>
            ))}
        </select>
    )
}

export default FilterDropdown
