from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

app = FastAPI()

model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

class TranslateRequest(BaseModel):
    text: str
    src_lang: str
    tgt_lang: str

class TranslateResponse(BaseModel):
    translation: str

@app.post("/api/translate", response_model=TranslateResponse)
def translate(req: TranslateRequest):
    tokenizer.src_lang = req.src_lang
    inputs = tokenizer(req.text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
    generated_tokens = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.convert_tokens_to_ids(req.tgt_lang),
        max_length=512
    )
    translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    return {"translation": translation}
