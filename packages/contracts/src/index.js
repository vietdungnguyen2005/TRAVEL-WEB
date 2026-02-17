"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingSchema = void 0;
__exportStar(require("./booking"), exports);
__exportStar(require("./rooms"), exports);
__exportStar(require("./payments"), exports);
__exportStar(require("./reviews"), exports);
__exportStar(require("./events"), exports);
// Export CreateBookingSchema for external usage
var booking_1 = require("./booking");
Object.defineProperty(exports, "CreateBookingSchema", { enumerable: true, get: function () { return booking_1.CreateBookingSchema; } });
//# sourceMappingURL=index.js.map