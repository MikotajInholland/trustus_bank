/**
 * Frontend MVC restructure (copy-based for Windows compatibility).
 */
import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')
const src = path.join(root, 'frontend/src')

function cpFile(fromRel, toRel) {
  const from = path.join(root, fromRel)
  const to = path.join(root, toRel)
  if (!fs.existsSync(from)) return
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  fs.unlinkSync(from)
  console.log('moved', fromRel, '->', toRel)
}

function cpDir(fromRel, toRel) {
  const from = path.join(root, fromRel)
  const to = path.join(root, toRel)
  if (!fs.existsSync(from)) return
  fs.cpSync(from, to, { recursive: true })
  fs.rmSync(from, { recursive: true, force: true })
  console.log('moved dir', fromRel, '->', toRel)
}

// Wesley
cpDir('frontend/src/pages/auth', 'frontend/src/features/auth/pages')
cpFile('frontend/src/pages/employee/ApprovalQueuePage.jsx', 'frontend/src/features/auth/pages/employee/ApprovalQueuePage.jsx')
cpFile('frontend/src/pages/employee/AccountClosurePage.jsx', 'frontend/src/features/auth/pages/employee/AccountClosurePage.jsx')
cpFile('frontend/src/context/AuthContext.jsx', 'frontend/src/features/auth/context/AuthContext.jsx')

// Darlington
cpDir('frontend/src/pages/account', 'frontend/src/features/account/pages')
cpFile('frontend/src/pages/employee/EmployeeCustomersPage.jsx', 'frontend/src/features/account/pages/employee/EmployeeCustomersPage.jsx')
cpFile('frontend/src/components/AccountCard.jsx', 'frontend/src/features/account/components/AccountCard.jsx')
cpFile('frontend/src/components/GlowBorder.jsx', 'frontend/src/features/account/components/GlowBorder.jsx')
cpFile('frontend/src/components/MagneticLink.jsx', 'frontend/src/features/account/components/MagneticLink.jsx')

// Mikotaj
cpDir('frontend/src/pages/transfer', 'frontend/src/features/transfer/pages')
cpFile('frontend/src/pages/employee/EmployeeTransferPage.jsx', 'frontend/src/features/transfer/pages/employee/EmployeeTransferPage.jsx')
cpFile('frontend/src/pages/employee/EmployeeTransactionHistoryPage.jsx', 'frontend/src/features/transfer/pages/employee/EmployeeTransactionHistoryPage.jsx')
cpFile('frontend/src/pages/employee/GlobalLedgerPage.jsx', 'frontend/src/features/transfer/pages/employee/GlobalLedgerPage.jsx')
cpFile('frontend/src/pages/employee/LimitManagementPage.jsx', 'frontend/src/features/transfer/pages/employee/LimitManagementPage.jsx')
cpFile('frontend/src/components/TransactionTable.jsx', 'frontend/src/features/transfer/components/TransactionTable.jsx')
cpFile('frontend/src/components/TransactionFilters.jsx', 'frontend/src/features/transfer/components/TransactionFilters.jsx')

// Shared
cpFile('frontend/src/pages/HomePage.jsx', 'frontend/src/shared/pages/HomePage.jsx')
cpFile('frontend/src/components/Layout.jsx', 'frontend/src/shared/components/Layout.jsx')
cpFile('frontend/src/components/PageHeader.jsx', 'frontend/src/shared/components/PageHeader.jsx')
cpFile('frontend/src/components/Pagination.jsx', 'frontend/src/shared/components/Pagination.jsx')
cpFile('frontend/src/components/GlassCard.jsx', 'frontend/src/shared/components/GlassCard.jsx')
cpFile('frontend/src/components/AnimatedOutlet.jsx', 'frontend/src/shared/components/AnimatedOutlet.jsx')
cpFile('frontend/src/components/AmbientField.jsx', 'frontend/src/shared/components/AmbientField.jsx')
cpFile('frontend/src/api/client.js', 'frontend/src/shared/api/client.js')
cpFile('frontend/src/hooks/useMotionFx.js', 'frontend/src/shared/hooks/useMotionFx.js')
cpDir('frontend/src/constants', 'frontend/src/shared/constants')

// Cleanup empty dirs
for (const d of ['frontend/src/pages', 'frontend/src/pages/employee', 'frontend/src/components', 'frontend/src/context', 'frontend/src/api', 'frontend/src/hooks']) {
  const p = path.join(root, d)
  if (fs.existsSync(p) && fs.readdirSync(p).length === 0) fs.rmdirSync(p)
}

function fixImports(filePath) {
  const rel = path.relative(src, filePath).replace(/\\/g, '/')
  let content = fs.readFileSync(filePath, 'utf8')
  const depth = rel.split('/').length - 1
  const shared = (sub) => '../'.repeat(depth) + 'shared/' + sub

  content = content.replace(/from ['"](\.\.\/)+api\/client['"]/g, `from '${shared('api/client')}'`)
  content = content.replace(/from ['"](\.\.\/)+components\/(PageHeader|Pagination|GlassCard|AnimatedOutlet|AmbientField)['"]/g,
    (_, __, c) => `from '${shared('components/' + c)}'`)
  content = content.replace(/from ['"](\.\.\/)+constants\//g, `from '${shared('constants/')}`)

  if (rel.startsWith('features/auth/pages/')) {
    content = content.replace(/from ['"](\.\.\/)+context\/AuthContext['"]/g, "from '../../context/AuthContext'")
    content = content.replace(/from ['"](\.\.\/)+components\/(PageHeader|GlassCard)['"]/g,
      (_, __, c) => `from '${rel.includes('/employee/') ? '../../../../' : '../../../'}shared/components/${c}'`)
  }
  if (rel.startsWith('features/account/pages/')) {
    content = content.replace(/from ['"](\.\.\/)+components\/(AccountCard|GlowBorder|MagneticLink)['"]/g, (_, __, c) => `from '../../components/${c}'`)
  }
  if (rel.startsWith('features/account/components/')) {
    content = content.replace(/from ['"]\.\.\/hooks\//g, "from '../../../shared/hooks/")
    content = content.replace(/from ['"]\.\.\/\.\.\/hooks\//g, "from '../../../shared/hooks/")
  }
  if (rel.startsWith('features/transfer/pages/')) {
    const compPrefix = rel.includes('/employee/') ? '../../../components/' : '../../components/'
    content = content.replace(/from ['"](\.\.\/)+components\/(TransactionTable|TransactionFilters)['"]/g,
      (_, __, c) => `from '${compPrefix}${c}'`)
  }
  if (rel.startsWith('shared/pages/HomePage.jsx')) {
    content = content.replace(/from ['"]\.\.\/context\/AuthContext['"]/g, "from '../../features/auth/context/AuthContext'")
  }
  if (rel.startsWith('shared/components/Layout.jsx')) {
    content = content.replace(/from ['"]\.\.\/context\/AuthContext['"]/g, "from '../../features/auth/context/AuthContext'")
  }
  if (rel.startsWith('features/auth/context/AuthContext.jsx')) {
    content = content.replace(/from ['"](\.\.\/)+api\/client['"]/g, "from '../../../shared/api/client'")
  }

  fs.writeFileSync(filePath, content)
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(jsx|js)$/.test(e.name)) out.push(p)
  }
  return out
}

for (const fp of walk(src)) {
  if (fp.endsWith('App.jsx') || fp.endsWith('main.jsx')) continue
  fixImports(fp)
}

// App.jsx
fs.writeFileSync(path.join(src, 'App.jsx'), `/**
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
console.log('Frontend MVC restructure complete')
