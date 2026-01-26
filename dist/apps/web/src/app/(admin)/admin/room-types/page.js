"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
export default function RoomTypesPage() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState(null);
    const [formData, setFormData] = useState({
        amenities: [],
        images: [],
        featured: false,
        available: true,
    });
    useEffect(() => {
        // Add logic here
    }, []);
    return (_jsx("div", {}));
}
//# sourceMappingURL=page.js.map