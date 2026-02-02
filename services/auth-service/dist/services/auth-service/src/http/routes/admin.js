"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const auth_guard_1 = require("../middlewares/auth-guard");
exports.adminRouter = (0, express_1.Router)();
// Simple smoke endpoint to validate RBAC wiring
exports.adminRouter.get('/me', auth_guard_1.requireAuth, (0, auth_guard_1.requireRole)(['ADMIN']), (req, res) => {
    res.json({ success: true, user: req.user });
});
//# sourceMappingURL=admin.js.map