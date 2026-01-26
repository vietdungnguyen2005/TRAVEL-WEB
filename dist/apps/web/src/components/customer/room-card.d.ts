interface RoomCardProps {
    room: {
        id: string;
        name: string;
        slug: string;
        description: string;
        pricePerNight: number;
        capacity: number;
        bedCount: number;
        size: number | null;
        images: string[];
        featured?: boolean;
    };
}
export declare function RoomCard({ room }: RoomCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=room-card.d.ts.map