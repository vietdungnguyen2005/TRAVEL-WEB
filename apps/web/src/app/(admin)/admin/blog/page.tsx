"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type PostStatus = "DRAFT" | "PUBLISHED";

type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImageUrl: string | null;
    status: PostStatus;
    createdAt: string;
    updatedAt: string;
};

type PostForm = {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImageUrl: string;
    status: PostStatus;
};

const EMPTY_FORM: PostForm = {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    status: "DRAFT",
};

function statusBadge(status: PostStatus) {
    return status === "PUBLISHED" ? (
        <Badge className="bg-green-100 text-green-800 border-green-200">PUBLISHED</Badge>
    ) : (
        <Badge variant="outline">DRAFT</Badge>
    );
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<BlogPost | null>(null);
    const [form, setForm] = useState<PostForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<PostStatus | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        try {
            setLoading(true);
            setLoadError(null);
            const res = await fetch("/api/admin/blog/posts", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });
            if (!res.ok) {
                const text = await res.text();
                setPosts([]);
                setLoadError(text || `Failed to fetch posts (${res.status})`);
                return;
            }
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (e) {
            setPosts([]);
            setLoadError(e instanceof Error ? e.message : "Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        let result = posts;
        if (filter !== "ALL") result = result.filter((p) => p.status === filter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
            );
        }
        return result;
    }, [posts, filter, searchQuery]);

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setOpen(true);
    }

    function openEdit(p: BlogPost) {
        setEditing(p);
        setForm({
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt ?? "",
            content: p.content,
            coverImageUrl: p.coverImageUrl ?? "",
            status: p.status,
        });
        setOpen(true);
    }

    async function save() {
        try {
            setSaving(true);

            const url = editing
                ? `/api/admin/blog/posts/${editing.id}`
                : "/api/admin/blog/posts";
            const method = editing ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    excerpt: form.excerpt || null,
                    coverImageUrl: form.coverImageUrl || null,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Save failed");
            }

            setOpen(false);
            await fetchPosts();
        } catch (e: any) {
            alert(e?.message || "Đã xảy ra lỗi");
        } finally {
            setSaving(false);
        }
    }

    async function remove(id: string) {
        const ok = confirm("Xóa bài viết này?");
        if (!ok) return;

        try {
            const res = await fetch(`/api/admin/blog/posts/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Delete failed");
            }
            await fetchPosts();
        } catch (e: any) {
            alert(e?.message || "Đã xảy ra lỗi");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý blog</h1>
                    <p className="text-gray-500 mt-2">Tạo, chỉnh sửa và xuất bản bài viết</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={filter === "ALL" ? "default" : "outline"}
                        onClick={() => setFilter("ALL")}
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={filter === "DRAFT" ? "default" : "outline"}
                        onClick={() => setFilter("DRAFT")}
                    >
                        Draft
                    </Button>
                    <Button
                        variant={filter === "PUBLISHED" ? "default" : "outline"}
                        onClick={() => setFilter("PUBLISHED")}
                    >
                        Published
                    </Button>
                    <Button onClick={openCreate}>Thêm bài</Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Input
                    placeholder="Tìm theo tiêu đề hoặc slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
                </div>
            ) : loadError ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-500">Chưa có bài viết nào</p>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-500">Chưa có bài viết nào</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((p) => (
                        <Card key={p.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-lg">{p.title}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">/{p.slug}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {statusBadge(p.status)}
                                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                                            Sửa
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    {p.excerpt || "(Chưa có mô tả ngắn)"}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Chỉnh sửa bài" : "Tạo bài mới"}</DialogTitle>
                        <DialogDescription>
                            Editor đơn giản: nhập nội dung dạng text/markdown.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Tiêu đề</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={form.slug}
                                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                placeholder="vd: huong-dan-dat-phong"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cover">Cover image URL</Label>
                            <Input
                                id="cover"
                                value={form.coverImageUrl}
                                onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="excerpt">Mô tả ngắn</Label>
                            <textarea
                                id="excerpt"
                                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={form.excerpt}
                                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="content">Nội dung</Label>
                            <textarea
                                id="content"
                                className="min-h-[240px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={form.content}
                                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Trạng thái</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={form.status === "DRAFT" ? "default" : "outline"}
                                    onClick={() => setForm((f) => ({ ...f, status: "DRAFT" }))}
                                >
                                    Draft
                                </Button>
                                <Button
                                    type="button"
                                    variant={form.status === "PUBLISHED" ? "default" : "outline"}
                                    onClick={() => setForm((f) => ({ ...f, status: "PUBLISHED" }))}
                                >
                                    Published
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                            Hủy
                        </Button>
                        <Button onClick={save} disabled={saving}>
                            {saving ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
