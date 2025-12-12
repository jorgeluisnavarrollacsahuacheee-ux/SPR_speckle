import os
from dotenv import load_dotenv
import uvicorn

base_dir = os.path.dirname(__file__)
env_path = os.path.join(base_dir, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

host = os.getenv("UVICORN_HOST", "0.0.0.0")
port = int(os.getenv("UVICORN_PORT", "8000"))

if __name__ == "__main__":
    uvicorn.run("main:app", host=host, port=port, reload=True)