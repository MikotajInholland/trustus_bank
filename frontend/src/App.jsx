/**
 * @summary Route definitions and auth-guarded layout.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout, { ProtectedRoute } from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import WaitingPage from './pages/auth/WaitingPage'
import DashboardPage from './pages/account/DashboardPage'
import AtmPage from './pages/account/AtmPage'
import AtmLoginPage from './pages/account/AtmLoginPage'
import InternalTransfersPage from './pages/account/InternalTransfersPage'
import TransfersPage from './pages/transfer/TransfersPage'
import TransactionsPage from './pages/transfer/TransactionsPage'
import ApprovalQueuePage from './pages/employee/ApprovalQueuePage'
import EmployeeCustomersPage from './pages/employee/EmployeeCustomersPage'
import EmployeeTransferPage from './pages/employee/EmployeeTransferPage'
import EmployeeTransactionHistoryPage from './pages/employee/EmployeeTransactionHistoryPage'
import AccountClosurePage from './pages/employee/AccountClosurePage'
import GlobalLedgerPage from './pages/employee/GlobalLedgerPage'
import LimitManagementPage from './pages/employee/LimitManagementPage'

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
