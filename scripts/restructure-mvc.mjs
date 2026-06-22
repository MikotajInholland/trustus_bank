/**
 * Restructures backend + frontend into per-developer MVC layout.
 * Run: node scripts/restructure-mvc.mjs
 */
import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')

const backendMoves = [
  // Wesley — auth
  ['backend/src/main/java/com/trustus/bank/auth/AuthController.java', 'backend/src/main/java/com/trustus/bank/auth/controller/AuthController.java', 'com.trustus.bank.auth.controller'],
  ['backend/src/main/java/com/trustus/bank/auth/AuthService.java', 'backend/src/main/java/com/trustus/bank/auth/service/AuthService.java', 'com.trustus.bank.auth.service'],
  ['backend/src/main/java/com/trustus/bank/auth/CustomerApprovalService.java', 'backend/src/main/java/com/trustus/bank/auth/service/CustomerApprovalService.java', 'com.trustus.bank.auth.service'],
  ['backend/src/main/java/com/trustus/bank/domain/user/User.java', 'backend/src/main/java/com/trustus/bank/auth/entity/User.java', 'com.trustus.bank.auth.entity'],
  ['backend/src/main/java/com/trustus/bank/domain/user/UserRepository.java', 'backend/src/main/java/com/trustus/bank/auth/repository/UserRepository.java', 'com.trustus.bank.auth.repository'],
  ['backend/src/main/java/com/trustus/bank/domain/customer/Customer.java', 'backend/src/main/java/com/trustus/bank/auth/entity/Customer.java', 'com.trustus.bank.auth.entity'],
  ['backend/src/main/java/com/trustus/bank/domain/customer/CustomerRepository.java', 'backend/src/main/java/com/trustus/bank/auth/repository/CustomerRepository.java', 'com.trustus.bank.auth.repository'],
  // Darlington — account
  ['backend/src/main/java/com/trustus/bank/account/AccountController.java', 'backend/src/main/java/com/trustus/bank/account/controller/AccountController.java', 'com.trustus.bank.account.controller'],
  ['backend/src/main/java/com/trustus/bank/account/AccountService.java', 'backend/src/main/java/com/trustus/bank/account/service/AccountService.java', 'com.trustus.bank.account.service'],
  ['backend/src/main/java/com/trustus/bank/domain/account/Account.java', 'backend/src/main/java/com/trustus/bank/account/entity/Account.java', 'com.trustus.bank.account.entity'],
  ['backend/src/main/java/com/trustus/bank/domain/account/AccountRepository.java', 'backend/src/main/java/com/trustus/bank/account/repository/AccountRepository.java', 'com.trustus.bank.account.repository'],
  // Mikotaj — transfer
  ['backend/src/main/java/com/trustus/bank/transfer/TransferController.java', 'backend/src/main/java/com/trustus/bank/transfer/controller/TransferController.java', 'com.trustus.bank.transfer.controller'],
  ['backend/src/main/java/com/trustus/bank/common/HealthController.java', 'backend/src/main/java/com/trustus/bank/transfer/controller/HealthController.java', 'com.trustus.bank.transfer.controller'],
  ['backend/src/main/java/com/trustus/bank/transfer/TransferService.java', 'backend/src/main/java/com/trustus/bank/transfer/service/TransferService.java', 'com.trustus.bank.transfer.service'],
  ['backend/src/main/java/com/trustus/bank/transfer/TransactionService.java', 'backend/src/main/java/com/trustus/bank/transfer/service/TransactionService.java', 'com.trustus.bank.transfer.service'],
  ['backend/src/main/java/com/trustus/bank/transfer/LimitService.java', 'backend/src/main/java/com/trustus/bank/transfer/service/LimitService.java', 'com.trustus.bank.transfer.service'],
  ['backend/src/main/java/com/trustus/bank/domain/transaction/Transaction.java', 'backend/src/main/java/com/trustus/bank/transfer/entity/Transaction.java', 'com.trustus.bank.transfer.entity'],
  ['backend/src/main/java/com/trustus/bank/domain/transaction/TransactionRepository.java', 'backend/src/main/java/com/trustus/bank/transfer/repository/TransactionRepository.java', 'com.trustus.bank.transfer.repository'],
  // Tests
  ['backend/src/test/java/com/trustus/bank/transfer/LimitServiceTest.java', 'backend/src/test/java/com/trustus/bank/transfer/service/LimitServiceTest.java', 'com.trustus.bank.transfer.service'],
]

const importReplacements = [
  ['com.trustus.bank.domain.transaction.TransactionRepository', 'com.trustus.bank.transfer.repository.TransactionRepository'],
  ['com.trustus.bank.domain.transaction.Transaction', 'com.trustus.bank.transfer.entity.Transaction'],
  ['com.trustus.bank.domain.account.AccountRepository', 'com.trustus.bank.account.repository.AccountRepository'],
  ['com.trustus.bank.domain.account.Account', 'com.trustus.bank.account.entity.Account'],
  ['com.trustus.bank.domain.customer.CustomerRepository', 'com.trustus.bank.auth.repository.CustomerRepository'],
  ['com.trustus.bank.domain.customer.Customer', 'com.trustus.bank.auth.entity.Customer'],
  ['com.trustus.bank.domain.user.UserRepository', 'com.trustus.bank.auth.repository.UserRepository'],
  ['com.trustus.bank.domain.user.User', 'com.trustus.bank.auth.entity.User'],
  ['com.trustus.bank.auth.CustomerApprovalService', 'com.trustus.bank.auth.service.CustomerApprovalService'],
  ['com.trustus.bank.auth.AuthService', 'com.trustus.bank.auth.service.AuthService'],
  ['com.trustus.bank.auth.AuthController', 'com.trustus.bank.auth.controller.AuthController'],
  ['com.trustus.bank.account.AccountService', 'com.trustus.bank.account.service.AccountService'],
  ['com.trustus.bank.account.AccountController', 'com.trustus.bank.account.controller.AccountController'],
  ['com.trustus.bank.transfer.LimitService', 'com.trustus.bank.transfer.service.LimitService'],
  ['com.trustus.bank.transfer.TransactionService', 'com.trustus.bank.transfer.service.TransactionService'],
  ['com.trustus.bank.transfer.TransferService', 'com.trustus.bank.transfer.service.TransferService'],
  ['com.trustus.bank.transfer.TransferController', 'com.trustus.bank.transfer.controller.TransferController'],
  ['com.trustus.bank.common.HealthController', 'com.trustus.bank.transfer.controller.HealthController'],
]

const frontendMoves = [
  // Wesley
  ['frontend/src/pages/auth', 'frontend/src/features/auth/pages'],
  ['frontend/src/pages/employee/ApprovalQueuePage.jsx', 'frontend/src/features/auth/pages/employee/ApprovalQueuePage.jsx'],
  ['frontend/src/pages/employee/AccountClosurePage.jsx', 'frontend/src/features/auth/pages/employee/AccountClosurePage.jsx'],
  ['frontend/src/context/AuthContext.jsx', 'frontend/src/features/auth/context/AuthContext.jsx'],
  // Darlington
  ['frontend/src/pages/account', 'frontend/src/features/account/pages'],
  ['frontend/src/pages/employee/EmployeeCustomersPage.jsx', 'frontend/src/features/account/pages/employee/EmployeeCustomersPage.jsx'],
  ['frontend/src/components/AccountCard.jsx', 'frontend/src/features/account/components/AccountCard.jsx'],
  ['frontend/src/components/GlowBorder.jsx', 'frontend/src/features/account/components/GlowBorder.jsx'],
  ['frontend/src/components/MagneticLink.jsx', 'frontend/src/features/account/components/MagneticLink.jsx'],
  // Mikotaj
  ['frontend/src/pages/transfer', 'frontend/src/features/transfer/pages'],
  ['frontend/src/pages/employee/EmployeeTransferPage.jsx', 'frontend/src/features/transfer/pages/employee/EmployeeTransferPage.jsx'],
  ['frontend/src/pages/employee/EmployeeTransactionHistoryPage.jsx', 'frontend/src/features/transfer/pages/employee/EmployeeTransactionHistoryPage.jsx'],
  ['frontend/src/pages/employee/GlobalLedgerPage.jsx', 'frontend/src/features/transfer/pages/employee/GlobalLedgerPage.jsx'],
  ['frontend/src/pages/employee/LimitManagementPage.jsx', 'frontend/src/features/transfer/pages/employee/LimitManagementPage.jsx'],
  ['frontend/src/components/TransactionTable.jsx', 'frontend/src/features/transfer/components/TransactionTable.jsx'],
  ['frontend/src/components/TransactionFilters.jsx', 'frontend/src/features/transfer/components/TransactionFilters.jsx'],
  // Shared
  ['frontend/src/pages/HomePage.jsx', 'frontend/src/shared/pages/HomePage.jsx'],
  ['frontend/src/components/Layout.jsx', 'frontend/src/shared/components/Layout.jsx'],
  ['frontend/src/components/PageHeader.jsx', 'frontend/src/shared/components/PageHeader.jsx'],
  ['frontend/src/components/Pagination.jsx', 'frontend/src/shared/components/Pagination.jsx'],
  ['frontend/src/components/GlassCard.jsx', 'frontend/src/shared/components/GlassCard.jsx'],
  ['frontend/src/components/AnimatedOutlet.jsx', 'frontend/src/shared/components/AnimatedOutlet.jsx'],
  ['frontend/src/components/AmbientField.jsx', 'frontend/src/shared/components/AmbientField.jsx'],
  ['frontend/src/api/client.js', 'frontend/src/shared/api/client.js'],
  ['frontend/src/hooks/useMotionFx.js', 'frontend/src/shared/hooks/useMotionFx.js'],
  ['frontend/src/constants', 'frontend/src/shared/constants'],
]

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function moveFile(fromRel, toRel, newPackage) {
  const from = path.join(root, fromRel)
  const to = path.join(root, toRel)
  if (!fs.existsSync(from)) {
    console.warn('skip missing', fromRel)
    return
  }
  ensureDirFor(to)
  let content = fs.readFileSync(from, 'utf8')
  if (newPackage) {
    content = content.replace(/^package [^;]+;/m, `package ${newPackage};`)
  }
  fs.writeFileSync(to, content)
  fs.unlinkSync(from)
  console.log('moved', fromRel, '->', toRel)
}

function walkJava(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walkJava(p, out)
    else if (entry.name.endsWith('.java')) out.push(p)
  }
  return out
}

function applyImportReplacements(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false
  for (const [from, to] of importReplacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to)
      changed = true
    }
  }
  if (changed) fs.writeFileSync(filePath, content)
}

function moveDir(fromRel, toRel) {
  const from = path.join(root, fromRel)
  const to = path.join(root, toRel)
  if (!fs.existsSync(from)) return
  ensureDirFor(to + '/.keep')
  fs.renameSync(from, to)
  console.log('moved dir', fromRel, '->', toRel)
}

function moveFrontendEntry(fromRel, toRel) {
  const from = path.join(root, fromRel)
  const to = path.join(root, toRel)
  if (!fs.existsSync(from)) {
    console.warn('skip missing frontend', fromRel)
    return
  }
  ensureDirFor(to)
  fs.renameSync(from, to)
  console.log('moved frontend', fromRel, '->', toRel)
}

// --- Backend ---
for (const [from, to, pkg] of backendMoves) {
  moveFile(from, to, pkg)
}

for (const fp of walkJava(path.join(root, 'backend'))) {
  applyImportReplacements(fp)
}

// Remove empty domain dirs
for (const sub of ['user', 'customer', 'account', 'transaction']) {
  const d = path.join(root, 'backend/src/main/java/com/trustus/bank/domain', sub)
  if (fs.existsSync(d) && fs.readdirSync(d).length === 0) fs.rmdirSync(d)
}
const domainDir = path.join(root, 'backend/src/main/java/com/trustus/bank/domain')
if (fs.existsSync(domainDir) && fs.readdirSync(domainDir).length === 0) fs.rmdirSync(domainDir)

// Update package-info files
const packageInfoUpdates = [
  ['backend/src/main/java/com/trustus/bank/auth/package-info.java', 'Auth, security, and customer onboarding (Wesley — Dev 1).\n *\n * MVC layout: controller, service, entity, repository, dto'],
  ['backend/src/main/java/com/trustus/bank/account/package-info.java', 'Accounts, dashboard, ATM, and directory (Darlington — Dev 2).\n *\n * MVC layout: controller, service, entity, repository, dto'],
  ['backend/src/main/java/com/trustus/bank/transfer/package-info.java', 'Transfers, limits, and ledger (Mikotaj — Dev 3).\n *\n * MVC layout: controller, service, entity, repository, dto'],
]
for (const [rel, summary] of packageInfoUpdates) {
  const fp = path.join(root, rel)
  if (!fs.existsSync(fp)) continue
  fs.writeFileSync(fp, `/**\n * @summary ${summary}\n */\npackage ${rel.includes('/auth/') ? 'com.trustus.bank.auth' : rel.includes('/account/') ? 'com.trustus.bank.account' : 'com.trustus.bank.transfer'};\n`)
}

// --- Frontend ---
for (const [from, to] of frontendMoves) {
  const fromPath = path.join(root, from)
  if (!fs.existsSync(fromPath)) continue
  if (fs.statSync(fromPath).isDirectory()) moveDir(from, to)
  else moveFrontendEntry(from, to)
}

// Clean empty old dirs
for (const d of ['frontend/src/pages', 'frontend/src/pages/employee', 'frontend/src/components', 'frontend/src/context', 'frontend/src/api', 'frontend/src/hooks', 'frontend/src/constants']) {
  const p = path.join(root, d)
  if (fs.existsSync(p) && fs.readdirSync(p).length === 0) fs.rmdirSync(p)
}

console.log('Backend + frontend file moves complete. Updating imports in JS/JSX...')

function walkFrontend(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walkFrontend(p, out)
    else if (/\.(jsx|js)$/.test(entry.name)) out.push(p)
  }
  return out
}

function fixFrontendImports(filePath) {
  const rel = path.relative(path.join(root, 'frontend/src'), filePath).replace(/\\/g, '/')
  let content = fs.readFileSync(filePath, 'utf8')
  const depth = rel.split('/').length - 1

  const toShared = (sub) => '../'.repeat(depth) + 'shared/' + sub

  content = content.replace(/from ['"](\.\.\/)+api\/client['"]/g, `from '${toShared('api/client')}'`)
  content = content.replace(/from ['"](\.\.\/)+components\/(PageHeader|Pagination|GlassCard|AnimatedOutlet|AmbientField|Layout)['"]/g,
    (_, __, comp) => `from '${toShared('components/' + comp)}'`)
  content = content.replace(/from ['"](\.\.\/)+constants\//g, `from '${toShared('constants/')}`)
  content = content.replace(/from ['"](\.\.\/)+hooks\//g, `from '${toShared('hooks/')}`)

  if (rel.startsWith('features/auth/')) {
    content = content.replace(/from ['"](\.\.\/)+context\/AuthContext['"]/g, "from '../../context/AuthContext'")
  }
  if (rel.startsWith('shared/')) {
    content = content.replace(/from ['"]\.\.\/context\/AuthContext['"]/g, "from '../../features/auth/context/AuthContext'")
    content = content.replace(/from ['"]\.\.\/context\/AuthContext['"]/g, "from '../../features/auth/context/AuthContext'")
  }
  if (rel.startsWith('features/account/pages/')) {
    content = content.replace(/from ['"](\.\.\/)+components\/(AccountCard|GlowBorder|MagneticLink)['"]/g,
      (_, __, comp) => `from '../../components/${comp}'`)
  }
  if (rel.startsWith('features/account/components/')) {
    content = content.replace(/from ['"]\.\.\/hooks\//g, "from '../../../shared/hooks/")
  }
  if (rel.startsWith('features/transfer/pages/')) {
    content = content.replace(/from ['"](\.\.\/)+components\/(TransactionTable|TransactionFilters)['"]/g,
      (_, __, comp) => {
        const prefix = rel.includes('/employee/') ? '../../../components/' : '../../components/'
        return `from '${prefix}${comp}'`
      })
  }

  fs.writeFileSync(filePath, content)
}

for (const fp of walkFrontend(path.join(root, 'frontend/src'))) {
  if (fp.endsWith('App.jsx')) continue
  fixFrontendImports(fp)
}

// Rewrite App.jsx with feature-based imports
const appPath = path.join(root, 'frontend/src/App.jsx')
fs.writeFileSync(appPath, `/**
 * @summary Route definitions and auth-guarded layout.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext'
import Layout, { ProtectedRoute } from './shared/components/Layout'
import HomePage from './shared/pages/HomePage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import WaitingPage from './features/auth/pages/WaitingPage'
import DashboardPage from './features/account/pages/DashboardPage'
import AtmPage from './features/account/pages/AtmPage'
import AtmLoginPage from './features/account/pages/AtmLoginPage'
import InternalTransfersPage from './features/account/pages/InternalTransfersPage'
import TransfersPage from './features/transfer/pages/TransfersPage'
import TransactionsPage from './features/transfer/pages/TransactionsPage'
import ApprovalQueuePage from './features/auth/pages/employee/ApprovalQueuePage'
import EmployeeCustomersPage from './features/account/pages/employee/EmployeeCustomersPage'
import EmployeeTransferPage from './features/transfer/pages/employee/EmployeeTransferPage'
import EmployeeTransactionHistoryPage from './features/transfer/pages/employee/EmployeeTransactionHistoryPage'
import AccountClosurePage from './features/auth/pages/employee/AccountClosurePage'
import GlobalLedgerPage from './features/transfer/pages/employee/GlobalLedgerPage'
import LimitManagementPage from './features/transfer/pages/employee/LimitManagementPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="waiting" element={
              <ProtectedRoute roles={['CUSTOMER']}>
                <WaitingPage />
              </ProtectedRoute>
            } />

            <Route path="dashboard" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="internal-transfers" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved>
                <InternalTransfersPage />
              </ProtectedRoute>
            } />
            <Route path="atm/login" element={<AtmLoginPage />} />
            <Route path="atm" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved>
                <AtmPage />
              </ProtectedRoute>
            } />
            <Route path="transfers" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved>
                <TransfersPage />
              </ProtectedRoute>
            } />
            <Route path="transactions" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved>
                <TransactionsPage />
              </ProtectedRoute>
            } />

            <Route path="employee/approvals" element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <ApprovalQueuePage />
              </ProtectedRoute>
            } />
            <Route path="employee/customers" element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <EmployeeCustomersPage />
              </ProtectedRoute>
            } />
            <Route path="employee/customers/:customerId/transactions" element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <EmployeeTransactionHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="employee/transfers" element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <EmployeeTransferPage />
              </ProtectedRoute>
            } />
            <Route path="employee/closure" element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <AccountClosurePage />
              </ProtectedRoute>
            } />
            <Route path="employee/ledger" element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <GlobalLedgerPage />
              </ProtectedRoute>
            } />
            <Route path="employee/limits" element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <LimitManagementPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
`)

console.log('Done. Run: mvn test (backend) and npm run build (frontend)')
