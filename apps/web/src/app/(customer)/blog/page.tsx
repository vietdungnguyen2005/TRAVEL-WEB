import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gatewayFetchServer } from "@/lib/gateway-server";

export const dynamic = "force-dynamic";

type BlogPostListItem = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
};

async function getPosts(): Promise<BlogPostListItem[]> {
    try {
        const res = await gatewayFetchServer("/api/blog/posts", {
            method: "GET",
            cache: "no-store",
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? (data as BlogPostListItem[]) : [];
    } catch {
        return [];
    }
}

export default async function BlogIndexPage() {
    const posts = await getPosts();
    return (
        <ClientLayout>
            <div className="container mx-auto px-4 py-10 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Blog</h1>
                    <p className="text-muted-foreground mt-1">
                        Tin tức, hướng dẫn, và trải nghiệm du lịch.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {posts.length === 0 ? (
                        <Card>
                            <CardContent className="py-10">
                                <p className="text-muted-foreground">Chưa có bài viết nào.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        posts.map((p) => (
                            <Card key={p.slug}>
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        <Link href={`/blog/${p.slug}`} className="hover:underline">
                                            {p.title}
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p className="mt-2">{p.excerpt || "(Chưa có mô tả ngắn)"}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
