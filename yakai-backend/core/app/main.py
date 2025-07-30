from fastapi import FastAPI
from app.routers import chat, translate#, ocr
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()

# # 添加 CORS 中间件
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # 或指定你的前端地址如 ["http://localhost:3000"]
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


app.include_router(chat.router, prefix="/api/chat")
app.include_router(translate.router, prefix="/api/translate")
# app.include_router(ocr.router, prefix="/api/ocr")
