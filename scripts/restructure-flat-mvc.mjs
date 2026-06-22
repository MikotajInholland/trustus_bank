/**
 * Flat MVC layout: controllers/, services/, repositories/, entities/, dto/
 * Run: node scripts/restructure-flat-mvc.mjs
 */
import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')
const javaRoot = path.join(root, 'backend/src/main/java/com/trustus/bank')
const testRoot = path.join(root, 'backend/src/test/java/com/trustus/bank')
const feRoot = path.join(root, 'frontend/src')

const backendMoves = [
  // controllers
  ['auth/controller/AuthController.java', 'controllers/AuthController.java', 'com.trustus.bank.controllers'],
  ['account/controller/AccountController.java', 'controllers/AccountController.java', 'com.trustus.bank.controllers'],
  ['transfer/controller/TransferController.java', 'controllers/TransferController.java', 'com.trustus.bank.controllers'],
  ['transfer/controller/HealthController.java', 'controllers/HealthController.java', 'com.trustus.bank.controllers'],
  // services
  ['auth/service/AuthService.java', 'services/AuthService.java', 'com.trustus.bank.services'],
  ['auth/service/CustomerApprovalService.java', 'services/CustomerApprovalService.java', 'com.trustus.bank.services'],
  ['account/service/AccountService.java', 'services/AccountService.java', 'com.trustus.bank.services'],
  ['transfer/service/TransferService.java', 'services/TransferService.java', 'com.trustus.bank.services'],
  ['transfer/service/TransactionService.java', 'services/TransactionService.java', 'com.trustus.bank.services'],
  ['transfer/service/LimitService.java', 'services/LimitService.java', 'com.trustus.bank.services'],
  // repositories
  ['auth/repository/UserRepository.java', 'repositories/UserRepository.java', 'com.trustus.bank.repositories'],
  ['auth/repository/CustomerRepository.java', 'repositories/CustomerRepository.java', 'com.trustus.bank.repositories'],
  ['account/repository/AccountRepository.java', 'repositories/AccountRepository.java', 'com.trustus.bank.repositories'],
  ['transfer/repository/TransactionRepository.java', 'repositories/TransactionRepository.java', 'com.trustus.bank.repositories'],
  // entities
  ['auth/entity/User.java', 'entities/User.java', 'com.trustus.bank.entities'],
  ['auth/entity/Customer.java', 'entities/Customer.java', 'com.trustus.bank.entities'],
  ['account/entity/Account.java', 'entities/Account.java', 'com.trustus.bank.entities'],
  ['transfer/entity/Transaction.java', 'entities/Transaction.java', 'com.trustus.bank.entities'],
  // dto
  ['auth/dto/LoginRequest.java', 'dto/LoginRequest.java', 'com.trustus.bank.dto'],
  ['auth/dto/LoginResponse.java', 'dto/LoginResponse.java', 'com.trustus.bank.dto'],
  ['auth/dto/RegistrationRequest.java', 'dto/RegistrationRequest.java', 'com.trustus.bank.dto'],
  ['auth/dto/RegistrationResponse.java', 'dto/RegistrationResponse.java', 'com.trustus.bank.dto'],
  ['auth/dto/ApprovalRequest.java', 'dto/ApprovalRequest.java', 'com.trustus.bank.dto'],
  ['auth/dto/CustomerSummaryDto.java', 'dto/CustomerSummaryDto.java', 'com.trustus.bank.dto'],
  ['account/dto/AccountDto.java', 'dto/AccountDto.java', 'com.trustus.bank.dto'],
  ['account/dto/AtmTransactionRequest.java', 'dto/AtmTransactionRequest.java', 'com.trustus.bank.dto'],
  ['account/dto/CustomerDashboardDto.java', 'dto/CustomerDashboardDto.java', 'com.trustus.bank.dto'],
  ['account/dto/CustomerDirectoryEntryDto.java', 'dto/CustomerDirectoryEntryDto.java', 'com.trustus.bank.dto'],
  ['account/dto/InternalTransferRequest.java', 'dto/InternalTransferRequest.java', 'com.trustus.bank.dto'],
  ['transfer/dto/CustomerLimitsDto.java', 'dto/CustomerLimitsDto.java', 'com.trustus.bank.dto'],
  ['transfer/dto/ExternalTransferRequest.java', 'dto/ExternalTransferRequest.java', 'com.trustus.bank.dto'],
  ['transfer/dto/TransactionDto.java', 'dto/TransactionDto.java', 'com.trustus.bank.dto'],
  ['transfer/dto/UpdateLimitsRequest.java', 'dto/UpdateLimitsRequest.java', 'com.trustus.bank.dto'],
]

const importReplacements = [
  ['com.trustus.bank.auth.controller.', 'com.trustus.bank.controllers.'],
  ['com.trustus.bank.account.controller.', 'com.trustus.bank.controllers.'],
  ['com.trustus.bank.transfer.controller.', 'com.trustus.bank.controllers.'],
  ['com.trustus.bank.auth.service.', 'com.trustus.bank.services.'],
  ['com.trustus.bank.account.service.', 'com.trustus.bank.services.'],
  ['com.trustus.bank.transfer.service.', 'com.trustus.bank.services.'],
  ['com.trustus.bank.auth.repository.', 'com.trustus.bank.repositories.'],
  ['com.trustus.bank.account.repository.', 'com.trustus.bank.repositories.'],
  ['com.trustus.bank.transfer.repository.', 'com.trustus.bank.repositories.'],
  ['com.trustus.bank.auth.entity.', 'com.trustus.bank.entities.'],
  ['com.trustus.bank.account.entity.', 'com.trustus.bank.entities.'],
  ['com.trustus.bank.transfer.entity.', 'com.trustus.bank.entities.'],
  ['com.trustus.bank.auth.dto.', 'com.trustus.bank.dto.'],
  ['com.trustus.bank.account.dto.', 'com.trustus.bank.dto.'],
  ['com.trustus.bank.transfer.dto.', 'com.trustus.bank.dto.'],
  ['com.trustus.bank.domain.transaction.', 'com.trustus.bank.entities.'],
  ['com.trustus.bank.domain.user.', 'com.trustus.bank.entities.'],
  ['com.trustus.bank.domain.customer.', 'com.trustus.bank.entities.'],
  ['com.trustus.bank.domain.account.', 'com.trustus.bank.entities.'],
  ['com.trustus.bank.domain.transaction.TransactionRepository', 'com.trustus.bank.repositories.TransactionRepository'],
  ['com.trustus.bank.domain.user.UserRepository', 'com.trustus.bank.repositories.UserRepository'],
  ['com.trustus.bank.domain.customer.CustomerRepository', 'com.trustus.bank.repositories.CustomerRepository'],
  ['com.trustus.bank.domain.account.AccountRepository', 'com.trustus.bank.repositories.AccountRepository'],
  ['com.trustus.bank.auth.AuthController', 'com.trustus.bank.controllers.AuthController'],
  ['com.trustus.bank.account.AccountController', 'com.trustus.bank.controllers.AccountController'],
  ['com.trustus.bank.transfer.TransferController', 'com.trustus.bank.controllers.TransferController'],
  ['com.trustus.bank.common.HealthController', 'com.trustus.bank.controllers.HealthController'],
  ['com.trustus.bank.auth.AuthService', 'com.trustus.bank.services.AuthService'],
  ['com.trustus.bank.auth.CustomerApprovalService', 'com.trustus.bank.services.CustomerApprovalService'],
  ['com.trustus.bank.account.AccountService', 'com.trustus.bank.services.AccountService'],
  ['com.trustus.bank.transfer.TransferService', 'com.trustus.bank.services.TransferService'],
  ['com.trustus.bank.transfer.TransactionService', 'com.trustus.bank.services.TransactionService'],
  ['com.trustus.bank.transfer.LimitService', 'com.trustus.bank.services.LimitService'],
]

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
}

function moveJava(relFrom, relTo, pkg) {
  const from = path.join(javaRoot, relFrom)
  const to = path.join(javaRoot, relTo)
  if (!fs.existsSync(from)) return false
  ensureDir(to)
  let content = fs.readFileSync(from, 'utf8')
  content = content.replace(/^package [^;]+;/m, `package ${pkg};`)
  fs.writeFileSync(to, content)
  console.log('  ', relFrom, '->', relTo)
  return true
}

function walkJava(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkJava(p, out)
    else if (e.name.endsWith('.java')) out.push(p)
  }
  return out
}

function applyImports(filePath) {
  let c = fs.readFileSync(filePath, 'utf8')
  for (const [from, to] of importReplacements) {
    c = c.split(from).join(to)
  }
  fs.writeFileSync(filePath, c)
}

function rmDirIfExists(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

// --- Backend: create flat structure ---
console.log('Backend flat MVC...')
for (const [from, to, pkg] of backendMoves) {
  moveJava(from, to, pkg)
}

// Fix entities vs repositories - TransactionRepository should not have been mapped to entities
for (const fp of walkJava(javaRoot)) {
  applyImports(fp)
}
for (const fp of walkJava(testRoot)) {
  applyImports(fp)
}

// Move test
const limitTestFrom = path.join(testRoot, 'transfer/service/LimitServiceTest.java')
const limitTestTo = path.join(testRoot, 'services/LimitServiceTest.java')
if (fs.existsSync(limitTestFrom)) {
  ensureDir(limitTestTo)
  let c = fs.readFileSync(limitTestFrom, 'utf8')
  c = c.replace(/^package [^;]+;/m, 'package com.trustus.bank.services;')
  fs.writeFileSync(limitTestTo, c)
  fs.unlinkSync(limitTestFrom)
}

// Remove old feature + domain folders
for (const d of ['auth', 'account', 'transfer', 'domain']) {
  rmDirIfExists(path.join(javaRoot, d))
}

// Remove duplicate flat files at feature root if any left
for (const f of ['AuthController.java', 'AccountController.java', 'TransferService.java', 'AccountService.java', 'TransactionService.java', 'LimitService.java', 'CustomerApprovalService.java']) {
  for (const sub of ['auth', 'account', 'transfer']) {
    const p = path.join(javaRoot, sub, f)
    if (fs.existsSync(p)) fs.unlinkSync(p)
  }
}

// --- Frontend flat MVC: views/, components/, services/ ---
console.log('Frontend flat MVC...')

const feSources = [
  ['features/auth/pages/LoginPage.jsx', 'views/auth/LoginPage.jsx'],
  ['features/auth/pages/RegisterPage.jsx', 'views/auth/RegisterPage.jsx'],
  ['features/auth/pages/WaitingPage.jsx', 'views/auth/WaitingPage.jsx'],
  ['features/auth/pages/employee/ApprovalQueuePage.jsx', 'views/employee/ApprovalQueuePage.jsx'],
  ['features/auth/pages/employee/AccountClosurePage.jsx', 'views/employee/AccountClosurePage.jsx'],
  ['features/account/pages/DashboardPage.jsx', 'views/account/DashboardPage.jsx'],
  ['features/account/pages/AtmPage.jsx', 'views/account/AtmPage.jsx'],
  ['features/account/pages/AtmLoginPage.jsx', 'views/account/AtmLoginPage.jsx'],
  ['features/account/pages/InternalTransfersPage.jsx', 'views/account/InternalTransfersPage.jsx'],
  ['features/account/pages/employee/EmployeeCustomersPage.jsx', 'views/employee/EmployeeCustomersPage.jsx'],
  ['features/transfer/pages/TransfersPage.jsx', 'views/transfer/TransfersPage.jsx'],
  ['features/transfer/pages/TransactionsPage.jsx', 'views/transfer/TransactionsPage.jsx'],
  ['features/transfer/pages/employee/EmployeeTransferPage.jsx', 'views/employee/EmployeeTransferPage.jsx'],
  ['features/transfer/pages/employee/EmployeeTransactionHistoryPage.jsx', 'views/employee/EmployeeTransactionHistoryPage.jsx'],
  ['features/transfer/pages/employee/GlobalLedgerPage.jsx', 'views/employee/GlobalLedgerPage.jsx'],
  ['features/transfer/pages/employee/LimitManagementPage.jsx', 'views/employee/LimitManagementPage.jsx'],
  ['shared/pages/HomePage.jsx', 'views/HomePage.jsx'],
  ['shared/components/Layout.jsx', 'components/Layout.jsx'],
  ['shared/components/PageHeader.jsx', 'components/PageHeader.jsx'],
  ['shared/components/Pagination.jsx', 'components/Pagination.jsx'],
  ['shared/components/GlassCard.jsx', 'components/GlassCard.jsx'],
  ['shared/components/AnimatedOutlet.jsx', 'components/AnimatedOutlet.jsx'],
  ['shared/components/AmbientField.jsx', 'components/AmbientField.jsx'],
  ['features/account/components/AccountCard.jsx', 'components/AccountCard.jsx'],
  ['features/account/components/GlowBorder.jsx', 'components/GlowBorder.jsx'],
  ['features/account/components/MagneticLink.jsx', 'components/MagneticLink.jsx'],
  ['features/transfer/components/TransactionTable.jsx', 'components/TransactionTable.jsx'],
  ['features/transfer/components/TransactionFilters.jsx', 'components/TransactionFilters.jsx'],
  ['shared/api/client.js', 'services/client.js'],
  ['features/auth/context/AuthContext.jsx', 'services/AuthContext.jsx'],
  ['shared/hooks/useMotionFx.js', 'services/useMotionFx.js'],
  ['shared/constants/demoAccounts.js', 'constants/demoAccounts.js'],
  ['shared/constants/developers.js', 'constants/developers.js'],
]

function cpFe(fromRel, toRel) {
  const from = path.join(feRoot, fromRel)
  const to = path.join(feRoot, toRel)
  if (!fs.existsSync(from)) return
  ensureDir(to)
  fs.copyFileSync(from, to)
}

for (const [from, to] of feSources) cpFe(from, to)

// Remove old frontend dirs (after copy)
rmDirIfExists(path.join(feRoot, 'features'))
rmDirIfExists(path.join(feRoot, 'shared'))
rmDirIfExists(path.join(feRoot, 'pages'))
for (const old of ['context', 'api', 'hooks']) {
  rmDirIfExists(path.join(feRoot, old))
}

// Fix frontend imports
function fixFeFile(filePath) {
  const rel = path.relative(feRoot, filePath).replace(/\\/g, '/')
  let c = fs.readFileSync(filePath, 'utf8')

  if (rel.startsWith('views/')) {
    const depth = rel.split('/').length - 1
    const up = '../'.repeat(depth)
    c = c.replace(/from ['"](\.\.\/)+shared\/api\/client['"]/g, "from '../../services/client'")
    c = c.replace(/from ['"](\.\.\/)+shared\/components\//g, `from '${up}components/`)
    c = c.replace(/from ['"](\.\.\/)+shared\/constants\//g, `from '${up}constants/`)
    c = c.replace(/from ['"](\.\.\/)+features\/auth\/context\/AuthContext['"]/g, "from '../../services/AuthContext'")
    c = c.replace(/from ['"]\.\.\/context\/AuthContext['"]/g, "from '../../services/AuthContext'")
    c = c.replace(/from ['"]\.\.\/\.\.\/auth\/context\/AuthContext['"]/g, "from '../../services/AuthContext'")
    c = c.replace(/from ['"]\.\.\/components\/(AccountCard|GlowBorder|MagneticLink)['"]/g, "from '../../components/$1'")
    c = c.replace(/from ['"]\.\.\/components\/(TransactionTable|TransactionFilters)['"]/g, "from '../../components/$1'")
    // normalize any remaining deep paths
    c = c.replace(/from ['"][^'"]*services\/client['"]/g, "from '../../services/client'")
    c = c.replace(/from ['"][^'"]*services\/AuthContext['"]/g, "from '../../services/AuthContext'")
  }

  if (rel.startsWith('components/')) {
    c = c.replace(/from ['"][^'"]*shared\/hooks\/useMotionFx['"]/g, "from '../services/useMotionFx'")
    c = c.replace(/from ['"]\.\.\/\.\.\/shared\/hooks\/useMotionFx['"]/g, "from '../services/useMotionFx'")
    c = c.replace(/from ['"]\.\.\/hooks\/useMotionFx['"]/g, "from '../services/useMotionFx'")
    c = c.replace(/from ['"][^'"]*features\/auth\/context\/AuthContext['"]/g, "from '../services/AuthContext'")
    c = c.replace(/from ['"]\.\.\/context\/AuthContext['"]/g, "from '../services/AuthContext'")
  }

  if (rel === 'views/HomePage.jsx') {
    c = c.replace(/from ['"][^'"]*AuthContext['"]/g, "from '../services/AuthContext'")
  }

  fs.writeFileSync(filePath, c)
}

function walkFe(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkFe(p, out)
    else if (/\.(jsx|js)$/.test(e.name)) out.push(p)
  }
  return out
}

for (const fp of walkFe(feRoot)) {
  if (fp.endsWith('App.jsx') || fp.endsWith('main.jsx')) continue
  fixFeFile(fp)
}

// App.jsx
fs.writeFileSync(path.join(feRoot, 'App.jsx'), `/**
 * @summary Route definitions and auth-guarded layout.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './services/AuthContext'
import Layout, { ProtectedRoute } from './components/Layout'
import HomePage from './views/HomePage'
import LoginPage from './views/auth/LoginPage'
import RegisterPage from './views/auth/RegisterPage'
import WaitingPage from './views/auth/WaitingPage'
import DashboardPage from './views/account/DashboardPage'
import AtmPage from './views/account/AtmPage'
import AtmLoginPage from './views/account/AtmLoginPage'
import InternalTransfersPage from './views/account/InternalTransfersPage'
import TransfersPage from './views/transfer/TransfersPage'
import TransactionsPage from './views/transfer/TransactionsPage'
import ApprovalQueuePage from './views/employee/ApprovalQueuePage'
import EmployeeCustomersPage from './views/employee/EmployeeCustomersPage'
import EmployeeTransferPage from './views/employee/EmployeeTransferPage'
import EmployeeTransactionHistoryPage from './views/employee/EmployeeTransactionHistoryPage'
import AccountClosurePage from './views/employee/AccountClosurePage'
import GlobalLedgerPage from './views/employee/GlobalLedgerPage'
import LimitManagementPage from './views/employee/LimitManagementPage'

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
              <ProtectedRoute roles={['CUSTOMER']}><WaitingPage /></ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved><DashboardPage /></ProtectedRoute>
            } />
            <Route path="internal-transfers" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved><InternalTransfersPage /></ProtectedRoute>
            } />
            <Route path="atm/login" element={<AtmLoginPage />} />
            <Route path="atm" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved><AtmPage /></ProtectedRoute>
            } />
            <Route path="transfers" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved><TransfersPage /></ProtectedRoute>
            } />
            <Route path="transactions" element={
              <ProtectedRoute roles={['CUSTOMER']} requireApproved><TransactionsPage /></ProtectedRoute>
            } />
            <Route path="employee/approvals" element={
              <ProtectedRoute roles={['EMPLOYEE']}><ApprovalQueuePage /></ProtectedRoute>
            } />
            <Route path="employee/customers" element={
              <ProtectedRoute roles={['EMPLOYEE']}><EmployeeCustomersPage /></ProtectedRoute>
            } />
            <Route path="employee/customers/:customerId/transactions" element={
              <ProtectedRoute roles={['EMPLOYEE']}><EmployeeTransactionHistoryPage /></ProtectedRoute>
            } />
            <Route path="employee/transfers" element={
              <ProtectedRoute roles={['EMPLOYEE']}><EmployeeTransferPage /></ProtectedRoute>
            } />
            <Route path="employee/closure" element={
              <ProtectedRoute roles={['EMPLOYEE']}><AccountClosurePage /></ProtectedRoute>
            } />
            <Route path="employee/ledger" element={
              <ProtectedRoute roles={['EMPLOYEE']}><GlobalLedgerPage /></ProtectedRoute>
            } />
            <Route path="employee/limits" element={
              <ProtectedRoute roles={['EMPLOYEE']}><LimitManagementPage /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
`)

// Fix CustomerSummaryDto import in entities if needed - handled by applyImports

// Ensure entity imports in repositories
for (const [repo, entityName] of [
  ['repositories/UserRepository.java', 'User'],
  ['repositories/CustomerRepository.java', 'Customer'],
  ['repositories/AccountRepository.java', 'Account'],
  ['repositories/TransactionRepository.java', 'Transaction'],
]) {
  const fp = path.join(javaRoot, repo)
  if (!fs.existsSync(fp)) continue
  let c = fs.readFileSync(fp, 'utf8')
  const imp = `import com.trustus.bank.entities.${entityName};`
  if (!c.includes(imp)) {
    c = c.replace(/^package [^;]+;\n/, (m) => `${m}\n${imp}\n`)
    fs.writeFileSync(fp, c)
  }
}

console.log('Done. Run mvn test && npm run build')
