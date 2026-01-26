"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = exports.auth = exports.signOut = exports.signIn = exports.handlers = void 0;
const next_auth_1 = __importDefault(require("next-auth"));
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const prisma_1 = require("../prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const rate_limit_1 = require("../rate-limit");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const authConfig = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        (0, google_1.default)({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        (0, credentials_1.default)({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const { email, password } = loginSchema.parse(credentials);
                    // Rate limiting: 5 login attempts per email per 15 minutes
                    const rateLimitResult = await (0, rate_limit_1.checkRateLimit)(`login:${email}`, 5);
                    if (!rateLimitResult.success) {
                        console.warn(`Rate limit exceeded for login attempt: ${email}`);
                        return null; // Return null to prevent login without exposing rate limit
                    }
                    const user = await prisma_1.prisma.user.findUnique({
                        where: { email },
                    });
                    if (!user || !user.password) {
                        return null;
                    }
                    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
                    if (!isPasswordValid) {
                        return null;
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                        phone: user.phone,
                    };
                }
                catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.phone = user.phone;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.phone = token.phone;
            }
            return session;
        },
    },
};
const _nextAuthResult = (0, next_auth_1.default)(authConfig);
exports.handlers = _nextAuthResult.handlers, exports.signIn = _nextAuthResult.signIn, exports.signOut = _nextAuthResult.signOut, exports.auth = _nextAuthResult.auth;
exports.GET = exports.handlers.GET, exports.POST = exports.handlers.POST;
//# sourceMappingURL=auth.js.map