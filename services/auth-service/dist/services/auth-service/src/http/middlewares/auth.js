"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
var shared_1 = require("@travel-web/shared");
Object.defineProperty(exports, "requireAuth", { enumerable: true, get: function () { return shared_1.verifyJWT; } });
Object.defineProperty(exports, "requireRole", { enumerable: true, get: function () { return shared_1.requireRole; } });
//# sourceMappingURL=auth.js.map