非常好的问题！下面是你这个前后端分离项目的详细启动步骤和常见问题排查方法，适合你现在的 yakai-backend（Node.js 网关 + Python FastAPI）和 llm-ui-openai-nextjs-example（前端 Next.js）。

---

## 一、启动顺序总览

1. 启动 Python FastAPI 服务（yakai-backend/core）
2. 启动 Node.js 网关服务（yakai-backend/gateway）
3. 启动前端 Next.js 服务（llm-ui-openai-nextjs-example）

---

## 二、详细步骤

### 1. 启动 Python FastAPI 服务

**（1）安装依赖**

进入 yakai-backend/core 目录，安装 requirements.txt 里的依赖：

```bash
cd yakai-backend/core
pip install -r requirements.txt
```

**（2）设置环境变量（如有）**

如果你的 LLM（如 deepseek/openai）需要 API KEY，建议用环境变量或 .env 文件管理。例如：

```bash
export DEEPSEEK_API_KEY=你的key
```
或者在 Windows 下：
```powershell
$env:DEEPSEEK_API_KEY="你的key"
```

**（3）启动 FastAPI 服务**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- 启动成功后，访问 http://localhost:8000/docs 可以看到自动生成的 API 文档。

---

### 2. 启动 Node.js 网关服务

**（1）安装依赖**

进入 yakai-backend/gateway 目录：

```bash
cd yakai-backend/gateway
npm install
```

**（2）编译 TypeScript**

```bash
npm run build
```

**（3）启动网关服务**

```bash
npm start
```

   npx tsc
   npm start

- 启动成功后，网关会监听 http://localhost:3001，所有 /api 请求会被代理到 Python 服务。

---

### 3. 启动前端 Next.js 服务

**（1）安装依赖**

进入 llm-ui-openai-nextjs-example 目录：

```bash
cd llm-ui-openai-nextjs-example
npm install
```

**（2）启动开发服务**

```bash
npm run dev
```

- 默认会监听 http://localhost:3000

---

### 4. 访问和测试

- 打开浏览器访问 http://localhost:3000
- 你会被重定向到 /markdown-qa 页面，输入内容后即可体验流式对话
- 前端请求会经过 Node.js 网关，再到 Python FastAPI，最后调用大模型

---

## 三、常见问题与排查

### 1. Python 服务无法启动

- 检查依赖是否安装完整（pip install -r requirements.txt）
- 检查端口是否被占用（8000）
- 检查 API KEY 是否设置正确

### 2. Node.js 网关报错

- 如果提示找不到 dist/index.js，说明没编译 TypeScript，需先 npm run build
- 如果端口 3001 被占用，换一个端口或释放端口

### 3. 前端请求无响应或报错

- 检查前端 fetch 的 URL 是否为 /api/chat/stream
- 检查 Node.js 网关和 Python 服务是否都已启动
- 检查浏览器控制台和网络面板，查看具体报错信息

### 4. 流式响应不工作

- 确认 Python FastAPI 返回的是 EventSourceResponse
- 确认 Node.js 网关对 /api/chat/stream 做了 selfHandleResponse: false 的代理
- 检查前端流式处理逻辑是否和后端事件格式一致

### 5. API KEY 泄露风险

- API KEY 只应保存在 Python 服务端，前端和网关都不应暴露

---

## 四、遇到困难怎么办？

- **看终端报错信息**，通常会有详细提示
- **用浏览器访问** http://localhost:8000/docs 检查 Python API 是否正常
- **用 Postman/curl 测试** http://localhost:3001/api/chat/stream 是否能拿到流式响应
- **查 package.json/scripts**，确认启动命令
- **随时向我提问**，贴出报错信息，我会帮你定位和解决！

---

如需一键脚本、环境变量配置、.env 文件示例、或遇到具体报错，欢迎随时贴出来，我会帮你详细解答！

前端（llm-ui-openai-nextjs-example）只与 Node.js 网关 yakai-backend 交互
Node.js 网关负责鉴权、路由、限流等，所有模型相关请求转发到 Python 服务
Python 服务用 FastAPI + LangChain 统一管理 LLM、翻译、OCR 等模型
Python 服务只暴露内部 API，安全、易扩展




你的问题非常好，涉及到**服务架构统一**和**模型管理方式**。

---

## 1. 为什么示例用 `uvicorn local_translate_api:app --port 8001`？

- 示例是为了让你**快速单独测试本地翻译服务**，不影响你现有的 yakai-backend 主服务（通常在 8000 端口）。
- 这样你可以先验证本地模型能否跑通，后续再集成到主 FastAPI 项目中。

---

## 2. 如何和主服务（llm/chat/translate等）统一管理？

你完全可以把本地模型加载和推理代码**直接集成到 yakai-backend/core/app/services/translate_service.py**，  
然后在 yakai-backend 的主 FastAPI 服务（如 `app/main.py`）里注册 `/api/translate` 路由，  
这样所有 API（/api/chat、/api/translate等）都由同一个 FastAPI 服务统一管理，端口也统一（如8000）。

---

## 3. 统一管理的推荐做法

### 步骤一：在 yakai-backend/core/app/services/translate_service.py 里加载模型

```python
# yakai-backend/core/app/services/translate_service.py
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

async def translate_nllb(text: str, src_lang: str, tgt_lang: str) -> str:
    tokenizer.src_lang = src_lang
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
    generated_tokens = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id[tgt_lang],
        max_length=512
    )
    translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    return translation
```

### 步骤二：在 yakai-backend/core/app/routers/translate.py 里注册路由

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.translate_service import translate_nllb

router = APIRouter()

class TranslateRequest(BaseModel):
    text: str
    src_lang: str
    tgt_lang: str

class TranslateResponse(BaseModel):
    translation: str

@router.post("/", response_model=TranslateResponse)
async def translate_api(req: TranslateRequest):
    try:
        translation = await translate_nllb(req.text, req.src_lang, req.tgt_lang)
        return {"translation": translation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 步骤三：在 app/main.py 统一注册

```python
from fastapi import FastAPI
from app.routers import chat, translate

app = FastAPI()
app.include_router(chat.router, prefix="/api/chat")
app.include_router(translate.router, prefix="/api/translate")
```

### 步骤四：统一启动

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
uvicorn local_translate_api:app --host 0.0.0.0 --port 8001
---

## 4. 总结

- **单独服务**（如 local_translate_api.py）适合模型调试和分布式部署。
- **统一服务**（如 main.py 统一注册所有路由）适合一体化管理，推荐你采用这种方式。
- 只需把模型加载和推理代码集成到 yakai-backend 的 translate_service.py，主服务启动即可。

---

如需完整的统一管理代码结构或遇到模型加载慢、显存不足等问题，欢迎随时提问！

curl -X 'POST' \
  'http://localhost:8001/api/translate' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "text": "你好，世界！",
  "src_lang": "zho_Hans",
  "tgt_lang": "eng_Latn"
}'