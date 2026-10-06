# Next-path — Phase 3 Dashboard Plan

Phase 3 is the dashboard and analytics project. It will be developed in a separate repository from the public assessment website.

## 1. Existing public website

The current production system is:

```text
Assessment frontend
    ↓
Backend API receives answers
    ↓
Versioned scoring service
    ↓
User report
    ↓
Supabase database
```

### Scope of the public website

- Frontend copy and labels may be updated when needed.
- The assessment flow remains stable.
- Existing scoring formulas remain versioned and isolated.
- Existing public API contracts remain backward compatible.
- The public website does not contain the dashboard.

## 2. Phase 3 architecture

```text
Dashboard frontend
    ↓
Read-only analytics API
    ↓
Supabase database
```

The database remains the single source of stored data. The dashboard reads summarized results through an API and never connects directly from the browser to raw database tables.

## 3. Initial dashboard scope

The dashboard should show aggregate information, not individual raw responses:

- national overview
- province-level overview
- district-level overview only when the website collects district data
- yearly and monthly trends
- respondent counts
- path proportions and rankings
- data coverage period
- last-updated timestamp

The first phase uses only data collected by the Next-path website. External labor-market statistics and third-party website data are out of scope until a separate data contract is approved.

## 4. Database work

- Use `sessions.completed_at` as the event time and derive year, month, and day in views.
- Keep `response_code`, `province_code`, and `age_years` as queryable session fields.
- Keep raw answers in `answers` as the source of truth.
- Use `province_catalog` to map province selections to stable English codes.
- Use `report_paths` as one relational row per ranked path.
- Build read-only views for completed sessions, answers, ranked paths, and trends.
- Do not create district data until the website collects it.
- Do not add tables for external data in the first phase.

## 5. Backend work

Add a read-only analytics API to the existing Railway Backend:

```text
GET /api/v1/analytics/current
GET /api/v1/analytics/trends
GET /api/v1/analytics/provinces
GET /api/v1/analytics/compare
```

The API should:

- read from Supabase views and relational tables;
- return counts, proportions, rankings, periods, and areas;
- avoid returning individual raw responses;
- avoid duplicating data;
- avoid changing the public assessment flow;
- remain separate from the write endpoints used by the website.

## 6. Dashboard frontend work

The dashboard repository will contain:

- dashboard pages and filters;
- charts and tables backed by the analytics API;
- access control appropriate for the intended audience;
- a clear last-updated indicator;
- no direct database credentials in browser code.

Visual design and chart selection should follow the API contract rather than precede it.

## 7. Explicitly out of scope

- changing v4.0 scoring;
- combining v4.0 with v0.9.1 scoring;
- adding confidence fields or calibration without a product decision;
- C5 matrix rebalancing;
- adding external labor-market data;
- placing the dashboard inside the public website;
- copying the production database to another service.

## 8. Work sequence

```text
Confirm database contract
    ↓
Confirm analytics API contract
    ↓
Implement read-only analytics API
    ↓
Test current snapshot and historical trends
    ↓
Implement dashboard frontend in a separate repository
    ↓
Connect dashboard to the analytics API
```

## Current status

- Public website: production-ready for the current scope
- Public frontend: copy and label updates complete
- Public Backend: session, answer, report, export, and feedback flow operational
- Production database: connected and migration-managed
- Analytics-ready fields: added through Backend migrations
- Analytics views: not yet implemented
- Analytics API: Phase 3 work
- Dashboard frontend: separate repository and not yet implemented
