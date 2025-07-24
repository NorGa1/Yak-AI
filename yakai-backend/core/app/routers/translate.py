# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import List
# from app.services.translate_service import translate_nllb, batch_translate_nllb, health_check, device

# router = APIRouter()

# class TranslateRequest(BaseModel):
#     text: str
#     src_lang: str  # 例如 "zho_Hans"（简体中文），"bod_Tibt"（藏语），"eng_Latn"（英文）等
#     tgt_lang: str

# class BatchTranslateRequest(BaseModel):
#     texts: List[str]
#     src_lang: str
#     tgt_lang: str

# class TranslateResponse(BaseModel):
#     translation: str

# class BatchTranslateResponse(BaseModel):
#     translations: List[str]

# @router.post("/", response_model=TranslateResponse)
# async def translate_api(req: TranslateRequest):
#     try:
#         translation = await translate_nllb(req.text, req.src_lang, req.tgt_lang)
#         return {"translation": translation}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/batch", response_model=BatchTranslateResponse)
# async def batch_translate_api(req: BatchTranslateRequest):
#     if len(req.texts) > 32:
#         raise HTTPException(status_code=400, detail="批量翻译最多支持32条文本")
#     try:
#         translations = await batch_translate_nllb(req.texts, req.src_lang, req.tgt_lang)
#         return {"translations": translations}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/health")
# def translate_health():
#     ok = health_check()
#     return {
#         "ok": ok,
#         "device": str(device),  # 需要从 service 层导出 device
#         "model_loaded": ok
#     }
# from fastapi.responses import StreamingResponse
# from app.services.translate_service import stream_translate_nllb

# @router.post("/stream")
# async def translate_stream_api(req: TranslateRequest):
#     async def event_generator():
#         async for chunk in stream_translate_nllb(req.text, req.src_lang, req.tgt_lang):
#             yield f"event: token\ndata: {chunk}\n\n"
#         yield "event: finished\ndata: true\n\n"
#     return StreamingResponse(event_generator(), media_type="text/event-stream")



from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse  # 显式从 responses 子模块导入
from pydantic import BaseModel
from typing import List
from app.services.translate_service import (
    translate_t5,          # 替换为T5翻译函数
    batch_translate_t5,    # 替换为批量翻译函数
    health_check,          # 健康检查函数（无需修改）
    device,                # 设备信息（无需修改）
    stream_translate_t5    # 替换为流式翻译函数
)

router = APIRouter()

class TranslateRequest(BaseModel):
    text: str
    src_lang: str  # 例如 "zho_Hans"（简体中文），"eng_Latn"（英文）等（注意T5不依赖特定语言代码格式）
    tgt_lang: str

class BatchTranslateRequest(BaseModel):
    texts: List[str]
    src_lang: str
    tgt_lang: str

class TranslateResponse(BaseModel):
    translation: str

class BatchTranslateResponse(BaseModel):
    translations: List[str]

@router.post("/", response_model=TranslateResponse)
async def translate_api(req: TranslateRequest):
    try:
        # 直接调用T5翻译函数，参数名保持一致
        translation = await translate_t5(req.text, req.src_lang, req.tgt_lang)
        return {"translation": translation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch", response_model=BatchTranslateResponse)
async def batch_translate_api(req: BatchTranslateRequest):
    if len(req.texts) > 32:
        raise HTTPException(status_code=400, detail="批量翻译最多支持32条文本")
    try:
        # 直接调用T5批量翻译函数
        translations = await batch_translate_t5(req.texts, req.src_lang, req.tgt_lang)
        return {"translations": translations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
def translate_health():
    # 健康检查逻辑完全不变
    ok = health_check()
    return {
        "ok": ok,
        "device": str(device),
        "model_loaded": ok
    }

@router.post("/stream")
async def translate_stream_api(req: TranslateRequest):
    async def event_generator():
        # 直接使用T5的流式翻译函数
        async for chunk in stream_translate_t5(req.text, req.src_lang, req.tgt_lang):
            yield f"event: token\ndata: {chunk}\n\n"
        yield "event: finished\ndata: true\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")