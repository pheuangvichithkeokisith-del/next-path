# API Client Layer

Separate API modules per PATHAI specification:
- `session.ts`: Session lifecycle (create session, save answer, complete session, get status)
- `assessment.ts`: Fetch questionnaire form definition
- `report.ts`: Fetch report and download markdown/JSON export
- `feedback.ts`: Submit user reflection and feedback
- `errors.ts`: Error handling (`ApiError`, `isSessionNotFound`)

Target base URL configured via `process.env.NEXT_PUBLIC_API_BASE_URL` (defaulting to `http://localhost:8000`).
