from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.llm_service import stream_chat_with_llm

router = APIRouter()

class ChatRequest(BaseModel):
    prompt: str

@router.post("/stream")
async def chat_stream_api(req: ChatRequest):
    prompt = req.prompt
    # 直接返回 StreamingResponse，手动设置 headers
    return StreamingResponse(
        stream_chat_with_llm(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
