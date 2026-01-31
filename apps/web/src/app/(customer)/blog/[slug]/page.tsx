import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gatewayFetchServer } from "@/lib/gateway-server";

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

    return (
        <ClientLayout>
            <div className="container mx-auto px-4 py-10">
                <div className="mb-6">
                    <Link href="/blog" className="text-sm text-blue-600 hover:underline">
                        ← Quay lại Blog
                    </Link>
                </div>

                {!post ? (
                    <Card>
                        <CardContent className="py-10">
                            <p>Bài viết không tồn tại.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{post.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(post.excerpt ? [post.excerpt, post.content] : [post.content]).map(
                                (block, idx) => (
                                    <p key={idx} className={idx === 0 && post.excerpt ? "font-medium" : ""}>
                                        {block}
                                    </p>
                                )
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </ClientLayout>
    );
}
