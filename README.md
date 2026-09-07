# Technical Interview Platform

Interview management system for internal technical interviews, built as a React frontend
plus two Node.js/Express microservices backed by SQL Server.

## Architecture

```
React (Vite)  :5173
        │  HTTP / REST (JWT Bearer)
        ▼
Auth Service         Interviewer Service
:4000                :4001
Login / Register     Candidates, Questions, Assignments,
JWT / Users / Roles  Interviews, Answers, Scoring
        └──────────┬──────────┘
                   ▼
        SQL Server — CreateInterviewDB
```

| Component            | Port | Responsibility                                        |
|----------------------|------|-------------------------------------------------------|
| React `interview-ui` | 5173 | UI (interviewer + candidate portals)                  |
| `auth-service`       | 4000 | Login, register, JWT, users, roles                    |
| `interviewer-service`| 4001 | Candidates, questions, assignments, interviews, answers, scoring |
| SQL Server           | 1433 / named instance | `CreateInterviewDB` database             |

## Folder layout

```
interview-platform/
├── database/                 # Run these in order in SSMS
│   ├── 01_create_database.sql
│   ├── 02_create_tables.sql
│   └── 03_seed_questions.sql
├── services/
│   ├── auth-service/         # port 4000
│   └── interviewer-service/  # port 4001
├── frontend/
│   └── interview-ui/         # port 5173 (Vite + React)
└── package.json              # convenience scripts
```

## Prerequisites

- Node.js 18+ (developed on Node 22)
- SQL Server 2016+ (local or network instance)
- SQL Server Management Studio (SSMS) to run the SQL scripts

## Setup

### 1. Database

Open `database/01_create_database.sql` then `02_create_tables.sql` then
`03_seed_questions.sql` in SSMS (in that order) on your SQL Server.

This creates `CreateInterviewDB` with 8 tables and seeds:

- 4 demo users (hashed with bcrypt): `interviewer`, `kishore`, `nanthini`, `sunil`
- 3 candidates with those logins
- 27 questions (5 common oral, 10 common MCQs with options, 4 candidate-specific each)
- question assignments for every candidate

### 2. Configure connections

Edit the `.env` files (both services) with your real SQL Server credentials and
pick a strong JWT secret:

```
DB_USER=sa
DB_PASSWORD=your_real_password
DB_HOST=VC-ITL-M031
DB_DATABASE=CreateInterviewDB
DB_INSTANCE_NAME=MEPZ_TEST_4_INST   # omit if using the default instance

JWT_SECRET=your_long_random_secret
```

> Security: never commit `.env` files or real passwords. The seeded demo password
> is `Interview@123` — change it before any real use.

Both services share the same `JWT_SECRET`, so tokens issued by `auth-service`
are accepted by `interviewer-service`.

### 3. Install and run

From the project root:

```sh
npm run install:all     # installs all three projects
npm run dev             # auth (4000), interviewer (4001), web (5173) concurrently
```

Or run each separately:

```sh
npm run auth            # services/auth-service       → http://localhost:4000
npm run interviewer     # services/interviewer-service → http://localhost:4001
npm run web             # frontend/interview-ui        → http://localhost:5173
```

### 4. Login

Open http://localhost:5173 and sign in

| Username      | Password          | Role                 |
|---------------|-------------------|----------------------|
| `interviewer` | `Interview@123`   | INTERVIEWER          |
| `kishore`     | `Interview@123`   | CANDIDATE            |
| `nanthini`    | `Interview@123`   | CANDIDATE            |
| `sunil`       | `Interview@123`   | CANDIDATE            |

## Features

**Interviewer**
- Dashboard with stats and recent interviews
- Candidate CRUD (+ optional login account), question assignment with drag-to-reorder
- Question bank: create / edit / deactivate oral and MCQ questions (with options)
- Live interview screen: question-by-question navigation, expected/weak answers
  (interviewer only), per-question score 1–10 and notes, MCQ auto-scoring
- 15-criteria scoring (10 oral + 5 written, each /10 → /150 total), complete interview,
  result screen

**Candidate**
- Sees only their own interviews and questions — never expected answers, scores,
  `IsCorrect`, notes, or other candidates
- Answers oral questions in a textarea or picks MCQ options; can revisit/update before completion

## API summary

Auth service (`:4000/api`)
| Method | Endpoint          | Access            |
|--------|-------------------|-------------------|
| POST   | `/auth/login`     | public            |
| POST   | `/auth/register`  | public            |
| GET    | `/auth/me`        | any authenticated |

Interviewer service (`:4001/api`)
| Method | Endpoint                                  | Access       |
|--------|-------------------------------------------|--------------|
| GET    | `/candidates`                             | INTERVIEWER  |
| POST   | `/candidates`                             | INTERVIEWER  |
| GET/PUT/DELETE | `/candidates/:id`              | INTERVIEWER  |
| GET    | `/candidates/:id/questions`               | INTERVIEWER  |
| POST   | `/candidates/:id/questions`               | INTERVIEWER  |
| DELETE | `/candidates/:id/questions/:questionId`    | INTERVIEWER  |
| GET    | `/questions` / `/questions/:id`           | INTERVIEWER  |
| POST   | `/questions`                              | INTERVIEWER  |
| PUT/DELETE | `/questions/:id`                     | INTERVIEWER  |
| POST   | `/interviews`                             | INTERVIEWER  |
| GET    | `/interviews`                             | INTERVIEWER  |
| GET    | `/interviews/mine`                        | CANDIDATE    |
| GET    | `/interviews/candidate/:candidateId`      | INTERVIEWER  |
| GET    | `/interviews/:id` / `/interviews/:id/questions` | both roles (role-filtered output) |
| PUT    | `/interviews/:id/start` / `complete`      | INTERVIEWER  |
| POST/PUT | `/interviews/:id/answers[/:answerId]`   | both roles (role-filtered fields) |

Role filtering is enforced **server-side**, not just by hiding buttons:
candidates receive `403` for interviewer-only endpoints, and responses are stripped
of `ExpectedAnswer`, `WeakAnswer`, `IsCorrect`, `InterviewerNotes` and `Score`.

## Security notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT payload contains `userId`, `role`, `name`; expires in 8h
- `IsCorrect`/`ExpectedAnswer` never leave the interviewer API for candidate roles
- Change the seeded demo password and JWT secret before production