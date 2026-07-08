# Learnika math-ai shell

Slice 3 creates a minimal FastAPI service shell only. It exposes health endpoints and basic configuration/logging foundations. It does not implement OCR, Speech-to-Text, LLM, SymPy behavior, homework processing, database access or authorization decisions.

## Local setup

Use Python 3.12. A local virtual environment is recommended:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
pnpm.cmd run dev
```

If `python` is not on PATH, set `LEARNIKA_PYTHON` to a Python 3.12 executable for the current shell before using pnpm scripts. Do not commit machine-specific Python paths.

