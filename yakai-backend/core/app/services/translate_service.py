# from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
# import torch
# from typing import List, Union

# model_path = "C:/Users/luorijia/.cache/modelscope/hub/models/facebook/nllb-200-distilled-600M"
# tokenizer = AutoTokenizer.from_pretrained(model_path, use_fast=False, local_files_only=True)
# model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True)
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# model = model.to(device)
# model.eval()
# print(f"模型已加载到 {device}")

# def health_check() -> bool:
#     # 简单健康检查，返回True表示模型可用
#     return model is not None and tokenizer is not None

# async def translate_nllb(text: str, src_lang: str, tgt_lang: str) -> str:
#     try:
#         tokenizer.src_lang = src_lang
#         inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
#         generated_tokens = model.generate(
#             **inputs,
#             forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_lang),
#             max_length=512
#         )
#         translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
#         return translation
#     except Exception as e:
#         print(f"翻译出错: {e}")
#         raise

# async def batch_translate_nllb(texts: List[str], src_lang: str, tgt_lang: str) -> List[str]:
#     tokenizer.src_lang = src_lang
#     inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
#     generated_tokens = model.generate(
#         **inputs,
#         forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_lang),
#         max_length=512
#     )
#     translations = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
#     return translations
# # 在 translate_service.py 末尾添加
# async def stream_translate_nllb(text: str, src_lang: str, tgt_lang: str):
#     """
#     伪流式：每生成一个token就yield一次，适合小模型和本地推理
#     """
#     tokenizer.src_lang = src_lang
#     inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
#     # 生成所有token
#     generated_tokens = model.generate(
#         **inputs,
#         forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_lang),
#         max_length=512
#     )
#     # 解码为token id序列
#     token_ids = generated_tokens[0].tolist()
#     # 逐步decode并yield
#     partial = ""
#     for i in range(1, len(token_ids) + 1):
#         new_text = tokenizer.decode(token_ids[:i], skip_special_tokens=True)
#         if new_text != partial:
#             # 只输出新内容
#             yield new_text[len(partial):]
#             partial = new_text
# # 文件末尾加
# __all__ = ["translate_nllb", "batch_translate_nllb", "health_check", "device", "stream_translate_nllb"]






from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
from typing import List, Union

# 使用本地保存的T5-small模型路径
model_path = r"D:\研究生\藏文NLP\translate\t5_small\checkpoint_125000"
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()
print(f"模型已加载到 {device}")

def health_check() -> bool:
    # 简单健康检查，返回True表示模型可用
    return model is not None and tokenizer is not None

async def translate_t5(text: str, src_lang: str, tgt_lang: str) -> str:
    try:
        # T5需要显式的任务描述前缀
        task_prefix = f"translate {src_lang} to {tgt_lang}: "
        
        # 构建完整输入文本
        full_input_text = task_prefix + text
        
        # 使用tokenizer编码文本
        inputs = tokenizer(full_input_text, 
                          return_tensors="pt", 
                          padding=True, 
                          truncation=True, 
                          max_length=512).to(device)
        
        # 生成翻译
        generated_tokens = model.generate(
            **inputs,
            max_length=512
        )
        
        # 解码生成的tokens
        translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
        
        # 移除任务前缀，只返回翻译结果
        return translation[len(task_prefix):]
    except Exception as e:
        print(f"翻译出错: {e}")
        raise

async def batch_translate_t5(texts: List[str], src_lang: str, tgt_lang: str) -> List[str]:
    try:
        # T5需要显式的任务描述前缀
        task_prefix = f"translate {src_lang} to {tgt_lang}: "
        
        # 为每个文本构建完整输入
        inputs_list = [task_prefix + text for text in texts]
        
        # 使用tokenizer编码所有文本
        inputs = tokenizer(inputs_list, 
                          return_tensors="pt", 
                          padding=True, 
                          truncation=True, 
                          max_length=512).to(device)
        
        # 生成翻译
        generated_tokens = model.generate(
            **inputs,
            max_length=512
        )
        
        # 解码生成的tokens
        translations = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
        
        # 移除每个翻译结果中的任务前缀
        return [translation[len(task_prefix):] for translation in translations]
    except Exception as e:
        print(f"批量翻译出错: {e}")
        raise

# 在 translate_service.py 末尾添加
async def stream_translate_t5(text: str, src_lang: str, tgt_lang: str):
    """
    伪流式：每生成一个token就yield一次，适合小模型和本地推理
    """
    try:
        # T5需要显式的任务描述前缀
        task_prefix = f"translate {src_lang} to {tgt_lang}: "
        
        # 构建完整输入文本
        full_input_text = task_prefix + text
        
        # 使用tokenizer编码文本
        inputs = tokenizer(full_input_text, 
                          return_tensors="pt", 
                          padding=True, 
                          truncation=True, 
                          max_length=512).to(device)
        
        # 生成所有token
        generated_tokens = model.generate(
            **inputs,
            max_length=512
        )
        
        # 解码为token id序列
        token_ids = generated_tokens[0].tolist()
        
        # 逐步decode并yield
        partial = ""
        for i in range(1, len(token_ids) + 1):
            new_text = tokenizer.decode(token_ids[:i], skip_special_tokens=True)
            if new_text != partial:
                # 只输出新内容
                yield new_text[len(partial):]
                partial = new_text
    except Exception as e:
        print(f"流式翻译出错: {e}")
        raise

# 文件末尾加
__all__ = ["translate_t5", "batch_translate_t5", "health_check", "device", "stream_translate_t5"]