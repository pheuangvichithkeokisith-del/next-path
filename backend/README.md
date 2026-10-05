# PATHAI Backend Service

A FastAPI backend foundation for the PATHAI career exploration and self-reflection platform.

## Core Principle

> **AI gives explanation, system does not decide user's future.**
> 
> PATHAI provides self-reflection patterns and exploration opportunities. It does not dictate career paths or make automated life decisions for the user.

---

## Architecture & Features

- **FastAPI**: Modern, high-performance async REST API.
- **SQLAlchemy 2.0 (Async)**: Database connection layer with async engine, connection pooling, and declarative models.
- **PostgreSQL Ready**: Fully configured for PostgreSQL with `asyncpg` / `psycopg2-binary` and Alembic migrations, plus seamless fallback to SQLite for local zero-dependency testing and development.
- **API Contracts Matching Frontend**: Endpoints and payloads 100% matched with Next.js frontend client (`/api/v1/form`, `/api/v1/sessions`, `/api/v1/sessions/{id}/answers`, `/api/v1/sessions/{id}/complete`, `/api/v1/sessions/{id}/status`, `/api/v1/sessions/{id}/report`, `/api/v1/sessions/{id}/export`, `/api/v1/sessions/{id}/feedback`).
- **Anonymous Sessions**: UUIDv4-based anonymous session handling.
- **Answer Upserting**: Stores user question answers with option codes, custom text, and other reasons.
- **Versioned Forms**: Supports the legacy `v0.9.1` form and the active `v4.0.0` form without mixing option codes or scoring rules.
- **Deterministic Reports**: Routes v4 sessions through `v4_report_service.py` and legacy sessions through the existing DS engine.
- **Reflection Export**: Stores report structure and supports formatted JSON / Markdown export.

---

## Project Structure

```
backend/
├── alembic/                      # Database migrations
│   ├── versions/
│   │   └── 0001_initial.py       # Initial schema creation
│   ├── env.py
│   └── script.py.mako
├── alembic.ini                   # Alembic configuration
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI application entry & CORS middleware
│   ├── config.py                 # Pydantic Settings & environment config
│   ├── database.py               # Async SQLAlchemy engine & get_db dependency
│   ├── data/
│   │   └── questions.json        # Legacy v0.9.1 questionnaire definitions
│   ├── models/                   # SQLAlchemy ORM Models
│   │   ├── __init__.py
│   │   ├── session.py            # SessionModel (anonymous sessions)
│   │   ├── answer.py             # AnswerModel (question responses)
│   │   ├── report.py             # ReportModel (reflection report placeholder)
│   │   └── feedback.py           # FeedbackModel (user agreement/feedback)
│   ├── schemas/                  # Pydantic Schemas & DTOs
│   │   ├── __init__.py
│   │   ├── form.py               # QuestionnaireForm, FormItem, FormOption
│   │   ├── session.py            # SessionResponse, SessionStatus, SessionCompleteResponse
│   │   ├── answer.py             # AnswerCreate, AnswerResponse
│   │   ├── report.py             # ReportResponse, ReportPattern, ReportPath, ContextFactors
│   │   └── feedback.py           # FeedbackCreate, FeedbackResponse
│   ├── services/                 # Business logic & Database interaction
│   │   ├── __init__.py
│   │   ├── form_service.py       # Questionnaire loader & cache
│   │   ├── session_service.py    # Session creation and status transitions
│   │   ├── answer_service.py     # Answer saving and upserting
│   │   ├── report_service.py     # Version-aware report generation & markdown export
│   │   ├── v4_report_service.py  # v4.0 scoring/report adapter
│   │   └── feedback_service.py   # User feedback recording
│   └── routers/                  # API Endpoint definitions
│       ├── __init__.py           # Consolidates /api/v1 router
│       ├── form.py               # GET /api/v1/form
│       ├── session.py            # POST /sessions, GET status, POST complete
│       ├── answer.py             # POST /sessions/{id}/answers
│       ├── report.py             # GET /sessions/{id}/report, GET /export
│       └── feedback.py           # POST /sessions/{id}/feedback
├── tests/                        # Automated test suite
│   ├── __init__.py
│   └── test_api.py               # Integration tests covering all endpoints
├── .env.example                  # Environment variable template
├── Dockerfile                    # Container definition
├── docker-compose.yml            # Multi-container setup (PostgreSQL + FastAPI)
├── pytest.ini                    # Pytest configuration
├── requirements.txt              # Python dependencies
└── README.md
```

---

## API Endpoints Overview

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `GET` | `/api/v1/form` | Retrieve the questionnaire form definition |
| `POST` | `/api/v1/sessions` | Create a new anonymous session |
| `GET` | `/api/v1/sessions/{session_id}/status` | Get current session status (`created`, `in_progress`, `completed`) |
| `POST` | `/api/v1/sessions/{session_id}/answers` | Save or update an answer for a question |
| `POST` | `/api/v1/sessions/{session_id}/complete` | Mark questionnaire as complete |
| `GET` | `/api/v1/sessions/{session_id}/report` | Retrieve the reflection report |
| `GET` | `/api/v1/sessions/{session_id}/export?format=json\|md` | Download reflection report as JSON or Markdown |
| `POST` | `/api/v1/sessions/{session_id}/feedback` | Submit reflection agreement and feedback |

---

## Getting Started

### 1. Local Setup with Virtual Environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Migrations (Optional)

```bash
python -m app.migration_bootstrap
alembic upgrade head
```

The bootstrap step safely stamps the original revision only when it finds the complete legacy schema created by `create_all`. It stops on a partial or unknown schema.

### 4. Start the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API docs are available at:
- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Running with Docker & PostgreSQL

To run both the PostgreSQL database and the FastAPI service with Docker Compose:

```bash
cd backend
docker compose up --build
```

---

## Running Tests

```bash
cd backend
source .venv/bin/activate
pytest
```
