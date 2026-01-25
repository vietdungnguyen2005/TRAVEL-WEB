"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { Plus, Edit, Trash2, Bed } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface RoomType {
    id: string;
    name: string;
    slug: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    bedCount: number;
    size: number;
    amenities: string[];
    images: string[];
    featured: boolean;
    available: boolean;
}

export default function RoomTypesPage() {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
    const [formData, setFormData] = useState<Partial<RoomType>>({
        amenities: [],
        images: [],
        featured: false,
        available: true,
    });

    useEffect(() => {
        // Add logic here
    }, []);

    return (
        <div>
            {/* Render room types here */}
        </div>
    );
}
