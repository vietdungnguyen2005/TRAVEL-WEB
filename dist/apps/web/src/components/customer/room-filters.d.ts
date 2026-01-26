interface RoomFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    initialFilters?: FilterState;
}
export interface FilterState {
    priceRange: [number, number];
    capacity: number | null;
    roomTypes: string[];
    sortBy: "price-asc" | "price-desc" | "capacity" | "name";
}
export declare function RoomFilters({ onFilterChange, initialFilters }: RoomFiltersProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=room-filters.d.ts.map