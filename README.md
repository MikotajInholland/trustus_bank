# TrustUs Bank

Full-stack student banking application. All monetary values use **EUR**. Persistence uses an in-memory **H2** database.

## Team

| Developer | Role | Theme | Backend package | Frontend folder |
|-----------|------|-------|-----------------|-----------------|
| **Wesley** | Dev 1 | Gatekeeper | `backend/.../auth`, `backend/.../security` | `frontend/src/pages/auth`, `employee/ApprovalQueuePage`, `employee/AccountClosurePage` |
| **Darlington** | Dev 2 | Teller | `backend/.../account` | `frontend/src/pages/account`, `employee/EmployeeCustomersPage` |
| **Mikotaj** | Dev 3 | Auditor | `backend/.../transfer` | `frontend/src/pages/transfer`, `employee/GlobalLedgerPage`, `employee/LimitManagementPage`, CI/deploy |

Ownership is documented in code comments on each page and in package-level notes — not shown as badges in the UI.

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

Default seeded accounts (use **Quick demo login** on the sign-in page, or sign in manually):

| Account | Email | Password |
|---------|-------|----------|
| Wesley (customer) | `wesley@trustus.bank` | `customer123` |
| Darlington (customer) | `darlington@trustus.bank` | `customer123` |
| Mikotaj (customer) | `mikotaj@trustus.bank` | `customer123` |
| Employee | `employee@trustus.bank` | `employee123` |

Each customer has approved checking (€2,500) and savings (€5,000) accounts with transfer limits configured.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173 — Vite proxies `/api` to the backend.

## Feature overview

### Wesley — Security, Identity & Onboarding

- Spring Security + JWT authentication (Customer / Employee roles)
- Swagger UI with documented routes and DTOs
- Customer registration (first name, last name, email, BSN, phone, password)
- Login UI with validation and duplicate email handling
- Waiting page for unapproved customers (can log in, features locked)
- Employee approval queue with search/filter
- Account provisioning on approval (checking + savings, IBANs `NLxxINHO0xxxxxxxxx`, limits)
- Account closure (search by name, disable accounts and user)

### Darlington — Accounts, Dashboard, ATM & Directory

- Customer dashboard (info, accounts, IBANs, balances, combined total)
- Employee paginated customer list with search
- Shared directory API (search by first/last/full name → IBAN)
- Internal transfers (checking ↔ savings)
- Mock ATM with dedicated login screen
- ATM deposits and withdrawals (withdrawals enforce transfer limits)

### Mikotaj — Transfers, Limits, Auditing & Infrastructure

- Central transaction system (all transfer types recorded)
- Customer external transfers (checking → checking, limits enforced)
- Employee transfers on behalf of customers
- Limit management (view/update daily & absolute limits)
- Customer transaction history (pagination + filters)
- Employee per-customer transaction history
- Global ledger (all transactions, paginated)
- CI/CD: GitHub Actions + GitHub Pages (frontend), Render.com template (backend)

## Deployment (Mikotaj)

- **Backend:** `render.yaml` on Render.com — set `TRUSTUS_JWT_SECRET` and CORS for your GitHub Pages URL.
- **Frontend:** GitHub Actions deploys to GitHub Pages on push to `main`. Set repository variable `VITE_API_URL` to your Render API URL.

## API overview

| Method | Path | Owner |
|--------|------|-------|
| POST | `/api/auth/login` | Wesley |
| POST | `/api/register` | Wesley |
| GET | `/api/employee/approvals` | Wesley |
| POST | `/api/employee/approvals/{id}` | Wesley |
| POST | `/api/employee/customers/{id}/close` | Wesley |
| GET | `/api/customer/dashboard` | Darlington |
| GET | `/api/employee/customers` | Darlington |
| GET | `/api/directory/customers` | Darlington |
| POST | `/api/customer/transfers/internal` | Darlington |
| POST | `/api/atm/deposit`, `/api/atm/withdraw` | Darlington |
| POST | `/api/customer/transfers/external` | Mikotaj |
| POST | `/api/employee/customers/{id}/transfers` | Mikotaj |
| GET/PUT | `/api/employee/customers/{id}/limits` | Mikotaj |
| GET | `/api/customer/transactions` | Mikotaj |
| GET | `/api/employee/customers/{id}/transactions` | Mikotaj |
| GET | `/api/employee/ledger` | Mikotaj |

See Swagger UI for request/response schemas.
