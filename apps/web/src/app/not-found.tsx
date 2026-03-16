import Link from "next/link";

export default function NotFound() {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Trang không tồn tại</h2>
            <p className="text-muted-foreground mb-8">
                Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xoá.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Về Trang chủ
                </Link>
                <Link
                    href="/blog"
                    className="inline-flex items-center px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    Xem Blog
                </Link>
            </div>
        </div>
    );
}
