import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gatewayFetchServer } from "@/lib/gateway-server";
import { MarkdownContent } from "@/components/blog/markdown-content";

export const dynamic = "force-dynamic";

type BlogPostDetail = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
};

async function getPost(slug: string): Promise<BlogPostDetail | null> {
    try {
        const res = await gatewayFetchServer(`/api/blog/posts/${encodeURIComponent(slug)}`, {
            method: "GET",
            cache: "no-store",
        });
        if (!res.ok) return null;
        return (await res.json()) as BlogPostDetail;
    } catch {
        return null;
    }
}

export default async function BlogDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound(); // Returns proper HTTP 404 instead of 200 with "not found" message
    }

    return (
        <>
            <div className="container mx-auto px-4 py-10">
                <div className="mb-6">
                    <Link href="/blog" className="text-sm text-blue-600 hover:underline">
                        ← Quay lại Blog
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{post.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {post.excerpt && (
                            <p className="font-medium text-muted-foreground">{post.excerpt}</p>
                        )}
                        <MarkdownContent content={post.content} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
