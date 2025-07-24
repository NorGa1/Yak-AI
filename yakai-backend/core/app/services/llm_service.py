from langchain_community.chat_models import ChatOpenAI
import asyncio
import os
api_key = os.environ.get("DEEPSEEK_API_KEY")

async def stream_chat_with_llm(prompt: str):
    llm = ChatOpenAI(
        openai_api_key=api_key,
        streaming=True,
        model="deepseek-chat",  # 或其他模型
        base_url="https://api.deepseek.com/v1"
    )
    # 构造多轮消息
    messages = [
        {"role": "system", "content": "你是藏文AI通用专家，输出都用藏语回答"},
        {"role": "user", "content": prompt}
    ]
    # LangChain 的流式接口
    async for chunk in llm.astream(messages):
        content = chunk.content
        if content:
            # 只输出一行 event: 和一行 data:
            yield f"event: token\ndata: {content}\n\n"
        await asyncio.sleep(0)  # 避免阻塞
    yield "event: finished\ndata: true\n\n"
