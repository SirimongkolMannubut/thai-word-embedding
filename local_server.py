# -*- coding: utf-8 -*-
"""
local_server.py
รัน Web Server สำหรับทดสอบบนเครื่อง Localhost (http://localhost:8000)
ก่อนนำขึ้น Deploy บน Vercel
"""

import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from api.index import app as api_app

# รวม FastAPI App กับ Static Files ใน public/
app = FastAPI(title="Thai Word Embedding Classroom Demo")

# Mount API routes
app.mount("/api", api_app)

# Mount Static Files for Web UI
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
if os.path.exists(PUBLIC_DIR):
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")

if __name__ == "__main__":
    print("=" * 65)
    print("  🚀 เริ่มต้นรัน Local Web Server...")
    print("  🌐 เปิดเว็บเบราว์เซอร์ที่: http://localhost:8000")
    print("  (กด Ctrl+C เพื่อหยุดการทำงาน)")
    print("=" * 65)
    uvicorn.run("local_server:app", host="127.0.0.1", port=8000, reload=True)
