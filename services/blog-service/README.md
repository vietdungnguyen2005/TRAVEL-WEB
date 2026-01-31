# blog-service

Simple blog microservice.

## Endpoints

### Public
- `GET /api/blog/posts` - list published posts
- `GET /api/blog/posts/:slug` - get a published post

### Admin
- `GET /api/admin/blog/posts`
- `POST /api/admin/blog/posts`
- `PATCH /api/admin/blog/posts/:id`
- `DELETE /api/admin/blog/posts/:id`

## Env
- `BLOG_DATABASE_URL`
- `PORT` (default 3008)
