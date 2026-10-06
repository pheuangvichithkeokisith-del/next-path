# Next-path Sectors

The system is intentionally documented in three sectors so debugging starts at
the first failing boundary instead of mixing UI, API, and storage concerns.

- [Frontend sector](frontend.md)
- [Backend sector](backend.md)
- [Database sector](database.md)
- [Full architecture and risk review](../system-architecture.md)

Use the sector order **Frontend → Backend → Database** for a browser failure.
Use **Database → Backend → Frontend** when the reported problem is incorrect
or missing stored data.

