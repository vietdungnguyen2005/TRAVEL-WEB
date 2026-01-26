interface Room {
    id: string;
    name: string;
    slug?: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    bedCount: number;
    size: number | null;
    images: string[];
    featured: boolean;
}
interface FeaturedRoomsProps {
    rooms: Room[];
}
export declare function FeaturedRooms({ rooms }: FeaturedRoomsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=featured-rooms.d.ts.map