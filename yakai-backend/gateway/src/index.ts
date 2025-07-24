import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();
app.use(cors());

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
    pathRewrite: { "^/api": "/api" },
    ws: true,
    selfHandleResponse: false
  })
);

app.listen(3001, () => {
  console.log("Gateway running at http://localhost:3001");
});
