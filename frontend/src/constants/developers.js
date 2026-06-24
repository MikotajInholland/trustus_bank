// Application module.
// @author Wesley, Darlington, Mikotaj (shared)
// Source-code ownership map (not shown in UI).
// Flat MVC layout — one folder per layer:
// Backend: controllers/, services/, repositories/, entities/, dto/
// Frontend: views/, components/, services/, constants/
// Wesley (Dev 1 — Gatekeeper): auth flow, security, onboarding
// Darlington (Dev 2 — Teller): accounts, dashboard, ATM, directory
// Mikotaj (Dev 3 — Auditor): transfers, limits, ledger, config

export const DEVELOPERS = {
  wesley: { name: 'Wesley', role: 'Dev 1', theme: 'Gatekeeper' },
  darlington: { name: 'Darlington', role: 'Dev 2', theme: 'Teller' },
  mikotaj: { name: 'Mikotaj', role: 'Dev 3', theme: 'Auditor' },
}

// Frontend view-folder ownership
export const FRONTEND_MODULES = {
  'views/auth': 'wesley',
  'views/account': 'darlington',
  'views/transfer': 'mikotaj',
  'views/employee/ApprovalQueuePage': 'wesley',
  'views/employee/AccountClosurePage': 'wesley',
  'views/employee/EmployeeCustomersPage': 'darlington',
  'views/employee/EmployeeTransferPage': 'mikotaj',
  'views/employee/EmployeeTransactionHistoryPage': 'mikotaj',
  'views/employee/GlobalLedgerPage': 'mikotaj',
  'views/employee/LimitManagementPage': 'mikotaj',
  'components': 'wesley, darlington, mikotaj',
  'services': 'wesley, darlington, mikotaj',
  'constants': 'wesley, darlington, mikotaj',
}

// Backend class ownership (flat packages)
export const BACKEND_CLASSES = {
  AuthController: 'wesley',
  AuthService: 'wesley',
  CustomerApprovalService: 'wesley',
  User: 'wesley',
  Customer: 'wesley',
  UserRepository: 'wesley',
  CustomerRepository: 'wesley',
  AccountController: 'darlington',
  AccountService: 'darlington',
  Account: 'darlington',
  AccountRepository: 'darlington',
  TransferController: 'mikotaj',
  HealthController: 'mikotaj',
  TransferService: 'mikotaj',
  TransactionService: 'mikotaj',
  LimitService: 'mikotaj',
  Transaction: 'mikotaj',
  TransactionRepository: 'mikotaj',
}

export const BACKEND_PACKAGES = {
  'com.trustus.bank.security': 'wesley',
  'com.trustus.bank.config': 'mikotaj',
  'com.trustus.bank.common': 'shared',
}
