# TrustUs Bank

Skeleton boilerplate for the student banking project. All monetary values use **EUR**. Persistence uses an in-memory **H2** database.

## Project structure

```
trustus_bank/
├── backend/          # Spring Boot 3 + H2 + JWT + Swagger
├── frontend/         # React + Vite + Bootstrap
├── .github/workflows # CI and GitHub Pages deploy
└── render.yaml       # Render.com backend deploy template
```

## Developer ownership

| Area | Package / folder | Theme |
|------|------------------|-------|
| Dev 1 — Security & onboarding | `backend/.../auth`, `frontend/src/pages/auth`, employee approvals | Gatekeeper |
| Dev 2 — Accounts & ATM | `backend/.../account`, `frontend/src/pages/account` | Teller |
| Dev 3 — Transfers & auditing | `backend/.../transfer`, `frontend/src/pages/transfer`, CI/deploy | Auditor |

Shared entities live under `backend/src/main/java/com/trustus/bank/domain/`.

## Quick start

### Backend

```bash
cd backend
mvn spring-boot:run
```

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 console: http://localhost:8080/h2-console

Default seeded employee:

- Email: `employee@trustus.bank`
- Password: `employee123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

The Vite dev server proxies `/api` to the backend.

## What's included

### Backend skeleton

- Spring Security with JWT filter and role-based access (`CUSTOMER`, `EMPLOYEE`)
- OpenAPI / Swagger UI configuration
- Domain entities: `User`, `Customer`, `Account`, `Transaction`
- REST controllers with route stubs for all three developer areas
- Registration, login, approval, dashboard, directory, ATM, transfers, limits, and ledger endpoints
- JUnit tests (`TrustusBankApplicationTests`, `AuthControllerTest`)
- IBAN format placeholder: `NLxxINHO0xxxxxxxxx`

### Frontend skeleton

- React Router pages mapped to each feature area
- Bootstrap layout and navigation
- Axios client with JWT interceptor
- Auth context for login state and role-based routes

## Deployment notes (Dev 3)

- **Backend:** use `render.yaml` on Render.com. Set `TRUSTUS_JWT_SECRET` and allowed CORS origins for your GitHub Pages URL.
- **Frontend:** GitHub Actions workflow builds and deploys to GitHub Pages on push to `main`. Configure repository variable `VITE_API_URL` to your Render API URL.

## Next steps for the team

1. Dev 1: finish search/filter on approval queue, account closure UI, and Swagger docs for auth DTOs.
2. Dev 2: wire customer search pagination, ATM login screen, and internal transfer UI polish.
3. Dev 3: optimize limit calculations, add transaction filters in the UI, and finalize Render/GitHub Pages env vars.

## API overview

| Method | Path | Owner |
|--------|------|-------|
| POST | `/api/auth/login` | Dev 1 |
| POST | `/api/register` | Dev 1 |
| GET | `/api/employee/approvals` | Dev 1 |
| POST | `/api/employee/approvals/{id}` | Dev 1 |
| GET | `/api/customer/dashboard` | Dev 2 |
| GET | `/api/directory/customers` | Dev 2 |
| POST | `/api/atm/deposit`, `/api/atm/withdraw` | Dev 2 |
| POST | `/api/customer/transfers/external` | Dev 3 |
| GET | `/api/customer/transactions` | Dev 3 |
| GET | `/api/employee/ledger` | Dev 3 |

See Swagger UI for the full list.
