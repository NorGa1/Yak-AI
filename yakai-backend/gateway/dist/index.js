"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use("/api", (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: "http://localhost:8000",
    changeOrigin: true,
    pathRewrite: { "^/api": "/api" },
    ws: true,
    selfHandleResponse: false
}));
app.listen(3001, () => {
    console.log("Gateway running at http://localhost:3001");
});
