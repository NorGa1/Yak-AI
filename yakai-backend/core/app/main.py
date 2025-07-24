from fastapi import FastAPI
from app.routers import chat, translate#, ocr
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()

app.include_router(chat.router, prefix="/api/chat")
app.include_router(translate.router, prefix="/api/translate")
# app.include_router(ocr.router, prefix="/api/ocr")
