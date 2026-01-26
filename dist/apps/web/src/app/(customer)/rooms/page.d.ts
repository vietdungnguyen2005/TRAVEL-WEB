interface PageProps {
    searchParams: {
        checkIn?: string;
        checkOut?: string;
        guests?: string;
        minPrice?: string;
        maxPrice?: string;
        capacity?: string;
        roomTypes?: string;
        sortBy?: string;
    };
}
export default function RoomsPage({ searchParams }: PageProps): Promise<import("react/jsx-runtime").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map