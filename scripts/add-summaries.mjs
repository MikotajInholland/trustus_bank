import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')

const javaSummaries = {
  'backend/src/main/java/com/trustus/bank/TrustusBankApplication.java':
    'Spring Boot entry point for the TrustUs Bank API.',
  'backend/src/main/java/com/trustus/bank/auth/CustomerApprovalService.java':
    'Approves customers and provisions checking/savings accounts.',
  'backend/src/main/java/com/trustus/bank/auth/dto/ApprovalRequest.java':
    'Request body for employee customer approval.',
  'backend/src/main/java/com/trustus/bank/auth/dto/CustomerSummaryDto.java':
    'Summary of a customer for employee list views.',
  'backend/src/main/java/com/trustus/bank/auth/dto/LoginRequest.java':
    'Login credentials (email and password).',
  'backend/src/main/java/com/trustus/bank/auth/dto/LoginResponse.java':
    'JWT and role returned after successful login.',
  'backend/src/main/java/com/trustus/bank/auth/dto/RegistrationRequest.java':
    'New customer registration payload.',
  'backend/src/main/java/com/trustus/bank/auth/dto/RegistrationResponse.java':
    'Confirmation returned after customer registration.',
  'backend/src/main/java/com/trustus/bank/account/dto/AccountDto.java':
    'Account type, IBAN, and balance for API responses.',
  'backend/src/main/java/com/trustus/bank/account/dto/AtmTransactionRequest.java':
    'ATM deposit or withdrawal amount.',
  'backend/src/main/java/com/trustus/bank/account/dto/CustomerDashboardDto.java':
    'Customer profile and account balances for the dashboard.',
  'backend/src/main/java/com/trustus/bank/account/dto/CustomerDirectoryEntryDto.java':
    'Directory search result with name and checking IBAN.',
  'backend/src/main/java/com/trustus/bank/account/dto/InternalTransferRequest.java':
    'Transfer between a customer\'s own accounts.',
  'backend/src/main/java/com/trustus/bank/transfer/TransactionService.java':
    'Persists transfer and ATM transaction ledger entries.',
  'backend/src/main/java/com/trustus/bank/transfer/TransactionRepositoryFacade.java':
    'Query facade for filtered transaction history and ledger views.',
  'backend/src/main/java/com/trustus/bank/transfer/dto/CustomerLimitsDto.java':
    'Daily and absolute transfer limits for a customer.',
  'backend/src/main/java/com/trustus/bank/transfer/dto/ExternalTransferRequest.java':
    'External transfer destination IBAN and amount.',
  'backend/src/main/java/com/trustus/bank/transfer/dto/TransactionDto.java':
    'Single ledger transaction for API responses.',
  'backend/src/main/java/com/trustus/bank/transfer/dto/UpdateLimitsRequest.java':
    'Employee request to update customer transfer limits.',
  'backend/src/main/java/com/trustus/bank/security/JwtAuthenticationFilter.java':
    'Extracts JWT from requests and sets Spring Security context.',
  'backend/src/main/java/com/trustus/bank/security/JwtTokenProvider.java':
    'Creates and validates JWT access tokens.',
  'backend/src/main/java/com/trustus/bank/config/CorsConfig.java':
    'CORS rules allowing local frontend dev servers.',
  'backend/src/main/java/com/trustus/bank/config/DataSeeder.java':
    'Seeds demo employee and customer accounts on startup.',
  'backend/src/main/java/com/trustus/bank/config/OpenApiConfig.java':
    'Swagger/OpenAPI metadata and JWT security scheme.',
  'backend/src/main/java/com/trustus/bank/config/PasswordConfig.java':
    'BCrypt password encoder bean.',
  'backend/src/main/java/com/trustus/bank/config/SecurityConfig.java':
    'HTTP security filter chain and route authorization rules.',
  'backend/src/main/java/com/trustus/bank/domain/account/Account.java':
    'JPA entity for a customer checking or savings account.',
  'backend/src/main/java/com/trustus/bank/domain/account/AccountRepository.java':
    'Persistence queries for accounts.',
  'backend/src/main/java/com/trustus/bank/domain/customer/Customer.java':
    'JPA entity for a bank customer profile.',
  'backend/src/main/java/com/trustus/bank/domain/customer/CustomerRepository.java':
    'Persistence queries for customers including search.',
  'backend/src/main/java/com/trustus/bank/domain/transaction/Transaction.java':
    'JPA entity for a money movement ledger entry.',
  'backend/src/main/java/com/trustus/bank/domain/transaction/TransactionRepository.java':
    'Persistence queries for transactions.',
  'backend/src/main/java/com/trustus/bank/domain/user/User.java':
    'JPA entity for login credentials and role.',
  'backend/src/main/java/com/trustus/bank/domain/user/UserRepository.java':
    'Persistence queries for users.',
  'backend/src/main/java/com/trustus/bank/common/HealthController.java':
    'Simple health check endpoint.',
  'backend/src/main/java/com/trustus/bank/common/dto/MoneyAmount.java':
    'Validated monetary amount wrapper.',
  'backend/src/main/java/com/trustus/bank/common/dto/PageResponse.java':
    'Generic paginated API response wrapper.',
  'backend/src/main/java/com/trustus/bank/common/enums/AccountType.java':
    'Checking or savings account type.',
  'backend/src/main/java/com/trustus/bank/common/enums/RoleType.java':
    'Customer or employee role.',
  'backend/src/main/java/com/trustus/bank/common/enums/TransactionType.java':
    'Ledger transaction categories.',
  'backend/src/main/java/com/trustus/bank/common/exception/BusinessRuleException.java':
    'Exception for rejected business operations (HTTP 422).',
  'backend/src/main/java/com/trustus/bank/common/exception/GlobalExceptionHandler.java':
    'Maps exceptions to consistent JSON error responses.',
  'backend/src/main/java/com/trustus/bank/common/exception/ResourceNotFoundException.java':
    'Exception for missing resources (HTTP 404).',
  'backend/src/test/java/com/trustus/bank/TrustusBankApplicationTests.java':
    'Smoke test that the Spring context loads.',
  'backend/src/test/java/com/trustus/bank/auth/AuthControllerTest.java':
    'Integration tests for login and registration endpoints.',
  'backend/src/test/java/com/trustus/bank/transfer/LimitServiceTest.java':
    'Unit tests for daily and absolute transfer limit checks.',
}

const javaExisting = {
  'backend/src/main/java/com/trustus/bank/auth/AuthController.java':
    'REST API for auth, registration, and customer onboarding.',
  'backend/src/main/java/com/trustus/bank/auth/AuthService.java':
    'Login, registration, and pending approval listing.',
  'backend/src/main/java/com/trustus/bank/account/AccountController.java':
    'Customer accounts, dashboard, ATM, and directory endpoints.',
  'backend/src/main/java/com/trustus/bank/account/AccountService.java':
    'Dashboard, directory search, internal transfers, and ATM operations.',
  'backend/src/main/java/com/trustus/bank/transfer/TransferController.java':
    'External transfers, limits, and transaction history endpoints.',
  'backend/src/main/java/com/trustus/bank/transfer/TransferService.java':
    'External and employee transfers with limit enforcement.',
  'backend/src/main/java/com/trustus/bank/transfer/LimitService.java':
    'Validates daily and absolute transfer limits per customer.',
  'backend/src/main/java/com/trustus/bank/security/CustomerApprovalFilter.java':
    'Blocks unapproved customers from customer and ATM routes.',
}

const frontendSummaries = {
  'frontend/src/main.jsx': 'React DOM bootstrap and root render.',
  'frontend/src/App.jsx': 'Route definitions and auth-guarded layout.',
  'frontend/src/api/client.js': 'Axios instance with JWT and error helpers.',
  'frontend/src/context/AuthContext.jsx': 'JWT auth state and login/logout helpers.',
  'frontend/src/components/GlassCard.jsx': 'Glassmorphism card wrapper for page sections.',
  'frontend/src/components/Layout.jsx': 'App shell with navigation and logout.',
  'frontend/src/components/PageHeader.jsx': 'Page title and subtitle block.',
  'frontend/src/components/Pagination.jsx': 'Reusable paginated list controls.',
  'frontend/src/components/TransactionFilters.jsx': 'Filter form for transaction history queries.',
  'frontend/src/components/TransactionTable.jsx': 'Table for displaying ledger transactions.',
  'frontend/src/constants/demoAccounts.js': 'Demo login credentials matching backend DataSeeder.',
  'frontend/src/constants/developers.js': 'Source-code ownership map (not shown in UI).',
  'frontend/src/pages/HomePage.jsx': 'Landing page with links to login and register.',
  'frontend/src/pages/auth/LoginPage.jsx': 'Sign-in form with one-click demo logins.',
  'frontend/src/pages/auth/RegisterPage.jsx': 'New customer registration form.',
  'frontend/src/pages/auth/WaitingPage.jsx': 'Screen shown while account approval is pending.',
  'frontend/src/pages/account/DashboardPage.jsx': 'Customer account balances and profile overview.',
  'frontend/src/pages/account/AtmLoginPage.jsx': 'ATM session login for customers.',
  'frontend/src/pages/account/AtmPage.jsx': 'ATM deposit and withdrawal interface.',
  'frontend/src/pages/account/InternalTransfersPage.jsx': 'Move funds between own checking and savings.',
  'frontend/src/pages/transfer/TransfersPage.jsx': 'Send external transfers from checking.',
  'frontend/src/pages/transfer/TransactionsPage.jsx': 'Customer transaction history with filters.',
  'frontend/src/pages/employee/ApprovalQueuePage.jsx': 'Employee queue to approve new customers.',
  'frontend/src/pages/employee/AccountClosurePage.jsx': 'Employee tool to close customer accounts.',
  'frontend/src/pages/employee/EmployeeCustomersPage.jsx': 'Searchable list of active customers.',
  'frontend/src/pages/employee/EmployeeTransferPage.jsx': 'Employee-initiated external transfers.',
  'frontend/src/pages/employee/EmployeeTransactionHistoryPage.jsx': 'Employee view of a customer\'s transactions.',
  'frontend/src/pages/employee/GlobalLedgerPage.jsx': 'Bank-wide transaction ledger for employees.',
  'frontend/src/pages/employee/LimitManagementPage.jsx': 'View and update customer transfer limits.',
}

function addJavaSummary(relPath, summary) {
  const filePath = path.join(root, relPath)
  let content = fs.readFileSync(filePath, 'utf8')
  if (content.includes('@summary')) return false

  const block = `/** @summary ${summary} */\n`
  if (content.startsWith('package ')) {
    content = block + content
  } else if (content.startsWith('/**')) {
    content = content.replace(/^\/\*\*([\s\S]*?)\*\//, (match) => {
      if (match.includes('@summary')) return match
      return match.replace('/**', `/** @summary ${summary}\n *`)
    })
  }
  fs.writeFileSync(filePath, content)
  return true
}

function addFrontendSummary(relPath, summary) {
  const filePath = path.join(root, relPath)
  let content = fs.readFileSync(filePath, 'utf8')
  if (content.includes('@summary')) return false

  const line = `// @summary ${summary}\n`
  if (content.startsWith('// Owner:')) {
    content = line + content
  } else if (content.startsWith('/**')) {
    content = content.replace(/^\/\*\*/, `/** @summary ${summary}\n *`)
  } else {
    content = line + content
  }
  fs.writeFileSync(filePath, content)
  return true
}

function addPackageInfoSummary(relPath, summary) {
  const filePath = path.join(root, relPath)
  let content = fs.readFileSync(filePath, 'utf8')
  if (content.includes('@summary')) return false
  content = content.replace(/^\/\*\*/, `/** @summary ${summary}\n *`)
  fs.writeFileSync(filePath, content)
  return true
}

let updated = 0
for (const [rel, summary] of Object.entries(javaSummaries)) {
  if (addJavaSummary(rel, summary)) updated++
}
for (const [rel, summary] of Object.entries(javaExisting)) {
  if (addJavaSummary(rel, summary)) updated++
}
for (const [rel, summary] of Object.entries(frontendSummaries)) {
  if (addFrontendSummary(rel, summary)) updated++
}

addPackageInfoSummary(
  'backend/src/main/java/com/trustus/bank/auth/package-info.java',
  'Auth, security, and customer onboarding (Wesley — Dev 1).'
)
addPackageInfoSummary(
  'backend/src/main/java/com/trustus/bank/account/package-info.java',
  'Accounts, dashboard, ATM, and directory (Darlington — Dev 2).'
)
addPackageInfoSummary(
  'backend/src/main/java/com/trustus/bank/transfer/package-info.java',
  'Transfers, limits, and ledger (Mikotaj — Dev 3).'
)
updated += 3

console.log(`Updated ${updated} files with @summary comments.`)
