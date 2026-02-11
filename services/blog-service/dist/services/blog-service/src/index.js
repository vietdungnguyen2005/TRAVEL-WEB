"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const shared_1 = require("@travel-web/shared");
const load_env_profile_1 = require("../../../infra/scripts/load-env-profile");
// Load root env + selected profile env (.env.docker/.env.supabase)
// In docker-compose, env can also be injected by the container; this won't override existing vars.
(0, load_env_profile_1.loadEnvProfile)({ cwd: process.cwd().split('/services/')[0] });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'blog-service' });
});
const requireAdmin = [shared_1.verifyJWT, (0, shared_1.requireRole)('ADMIN')];
// Public: list published posts
app.get('/api/blog/posts', async (_req, res) => {
    const posts = await prisma_1.default.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            coverImageUrl: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    res.setHeader('Cache-Control', 'no-store');
    res.json(posts);
});
// Public: get published post by slug
app.get('/api/blog/posts/:slug', async (req, res) => {
    const slug = String(req.params.slug);
    const post = await prisma_1.default.post.findFirst({
        where: { slug, status: 'PUBLISHED' },
        select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            content: true,
            coverImageUrl: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!post)
        return res.status(404).json({ error: 'Post not found' });
    res.setHeader('Cache-Control', 'no-store');
    res.json(post);
});
// Admin: list all posts
app.get('/api/admin/blog/posts', ...requireAdmin, async (_req, res) => {
    const posts = await prisma_1.default.post.findMany({
        orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
});
// Admin: create
app.post('/api/admin/blog/posts', ...requireAdmin, async (req, res) => {
    const { slug, title, excerpt, content, coverImageUrl, status } = req.body || {};
    if (!slug || !title || !content) {
        return res.status(400).json({ error: 'slug, title, content are required' });
    }
    const post = await prisma_1.default.post.create({
        data: {
            slug: String(slug),
            title: String(title),
            excerpt: excerpt ? String(excerpt) : null,
            content: String(content),
            coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
            status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        },
    });
    res.status(201).json(post);
});
// Admin: update
app.patch('/api/admin/blog/posts/:id', ...requireAdmin, async (req, res) => {
    const id = String(req.params.id);
    const { slug, title, excerpt, content, coverImageUrl, status } = req.body || {};
    const post = await prisma_1.default.post.update({
        where: { id },
        data: {
            slug: slug ? String(slug) : undefined,
            title: title ? String(title) : undefined,
            excerpt: excerpt === null ? null : excerpt ? String(excerpt) : undefined,
            content: content ? String(content) : undefined,
            coverImageUrl: coverImageUrl === null ? null : coverImageUrl ? String(coverImageUrl) : undefined,
            status: status ? (status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT') : undefined,
        },
    });
    res.json(post);
});
// Admin: delete
app.delete('/api/admin/blog/posts/:id', ...requireAdmin, async (req, res) => {
    const id = String(req.params.id);
    await prisma_1.default.post.delete({ where: { id } });
    res.status(204).send();
});
// NOTE: keep away from auth-service default (3001)
const port = Number(process.env.PORT || 3008);
app.listen(port, () => {
    console.log(`Blog service running on port ${port}`);
});
//# sourceMappingURL=index.js.map