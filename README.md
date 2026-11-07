# SmartStudy — Study Planner and Assignment Tracker

**Selected stack:** HTML/CSS/vanilla JavaScript + Node.js/Express + MongoDB/Mongoose.

## Quick start

- Node.js 18+ and MongoDB are required.
- `npm install`
- Copy `.env.example` to `.env`; set `MONGODB_URI` and a strong `JWT_SECRET`.
- `npm run seed` creates a development administrator (credentials are printed; change them immediately).
- `npm start`
- Student app: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin.html
- Health check: http://localhost:3000/api/health
- Tests: `npm test`

See `docs/PROJECT_SPECIFICATION.md` for functional requirements, API contract, milestones, work split and submission metadata that still needs confirmation. See `docs/ER_DIAGRAM.md` for the data model.

The student dashboard supports assignment creation, deadline/status/progress tracking, submissions by text or HTTP(S) URL, and in-app reminder scheduling/read status. The administrator dashboard supports platform metrics, student management, and assignment review. `npm test` runs API integration tests against an ephemeral MongoDB instance, including submission, reminder and administrator workflows.

**Important:** The original archive contained no proposal copies. This repository does not claim to have deleted or reconciled a proposal document. The two students' names/IDs, official course code and final supervisor must be confirmed and inserted in the specification/title page before submission.
