import SearchBar from "../../molecules/SearchBar/SearchBar"
import FilterDropdown from "../../molecules/FilterDropdown/FilterDropdown"
type Props = {
    search: string
    onSearchChange: (value: string) => void
    category: string
    onCategoryChange: (value: string) => void
    availability: string
    onAvailabilityChange: (value: string) => void
    categories: string[]
}

const BookFilters=({
    search,
    onSearchChange,
    category,
    onCategoryChange,
    availability,
    onAvailabilityChange,
    categories,
}: Props)=>{
    return(
        <div className="space-y-3">
            <SearchBar
                placeholder="Search by title, author, or publisher"
                value={search}
                onChange={onSearchChange}
            />

            <div className="flex gap-2">
                <FilterDropdown
                    options={["All Genres", ...categories]}
                    value={category}
                    onChange={onCategoryChange}
                />

                <FilterDropdown
                    options={["All Books", "Available", "Unavailable"]}
                    value={availability}
                    onChange={onAvailabilityChange}
                />
            </div>

        </div>
    )
}

export default BookFilters
