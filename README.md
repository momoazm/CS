# CS — MOMO Knowledge Oracle (RAG)

A retrieval-augmented knowledge assistant. Upload files into a vector database, then ask
questions and get answers grounded in your own documents, with citations to the exact
source passages.

- **Front-end** — `website/index.html`: a single-file MOMO-branded UI (Tailwind via CDN,
  vanilla JS). Upload files, ask questions, see cited sources. Falls back to an in-browser
  retrieval engine if the backend isn't reachable.
- **Back-end** — `CS/webapp/`: a RAG service over Google **Gemini** (`gemini-embedding-2`
  embeddings + Gemini chat) and **Pinecone** (vector store).
  - `app.py` — the original Gradio app (`ingest_uploads`, `rag_chat`).
  - `api.py` — a FastAPI bridge exposing JSON endpoints **and** serving the website on the
    same origin, so the MOMO page is the front-end to the RAG system.

## Endpoints (`CS/webapp/api.py`)

| Method | Path          | Purpose                                            |
|--------|---------------|----------------------------------------------------|
| GET    | `/`           | Serves the MOMO website                            |
| GET    | `/api/health` | `{ok, has_gemini, has_pinecone}`                   |
| GET    | `/api/stats`  | Pinecone vector count                              |
| POST   | `/api/ingest` | multipart `files[]` + `text` → embed & upsert      |
| POST   | `/api/ask`    | `{question}` → `{answer, sources[]}` (retrieve+LLM)|

## Configuration (environment variables)

Set these as host/Space secrets — **do not commit them** (`.env` is gitignored):

| Variable             | Required | Notes                                       |
|----------------------|----------|---------------------------------------------|
| `GEMINI_API_KEY`     | yes      | Google AI Studio key                        |
| `PINECONE_API_KEY`   | yes      | Pinecone key                                |
| `PINECONE_INDEX`     | yes      | Index name (3072-dim, e.g. `media-memory`)  |
| `GEMINI_CHAT_MODEL`  | no       | Defaults to `gemini-2.5-flash`              |
| `PORT`               | no       | Defaults to `8000`                          |

For local dev you can instead copy `CS/.env.example` → `CS/.env` and fill it in.

## Run locally

```bash
python -m venv .venv && .venv/Scripts/python -m pip install -r requirements.txt
# one-time: create the Pinecone index
.venv/Scripts/python CS/tools/setup_pinecone.py
# start the app (serves UI + API on http://localhost:8000)
.venv/Scripts/python CS/webapp/api.py
```

## Deploy

The app binds `0.0.0.0:$PORT`, so it runs on most platforms as-is:

- **Render / Railway / Fly.io** — start command `python CS/webapp/api.py` (see `Procfile`),
  install from `requirements.txt`, set the env vars above.
- **Custom domain** — point the host's domain settings at the service. Behind your own
  Nginx/Caddy, reverse-proxy `/` to the app's port.

> Note: media bytes are not stored in Pinecone — only embeddings + small metadata. Keep
> originals elsewhere.
