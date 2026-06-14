/**
 * @summary Application module.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
/** @summary Source-code ownership map (not shown in UI).
 *
 * Source-code ownership map (not displayed in the UI).
 *
 * Wesley   — Dev 1, Gatekeeper: auth, security, onboarding
 * Darlington — Dev 2, Teller: accounts, dashboard, ATM, directory
 * Mikotaj  — Dev 3, Auditor: transfers, limits, ledger, infrastructure
 */

export const DEVELOPERS = {
  wesley: { name: 'Wesley', role: 'Dev 1', theme: 'Gatekeeper' },
  darlington: { name: 'Darlington', role: 'Dev 2', theme: 'Teller' },
  mikotaj: { name: 'Mikotaj', role: 'Dev 3', theme: 'Auditor' },
}

/** Folder-level frontend ownership */
export const FRONTEND_MODULES = {
  'pages/auth': 'wesley',
  'pages/account': 'darlington',
  'pages/transfer': 'mikotaj',
  'pages/employee/ApprovalQueuePage': 'wesley',
  'pages/employee/AccountClosurePage': 'wesley',
  'pages/employee/EmployeeCustomersPage': 'darlington',
  'pages/employee/EmployeeTransferPage': 'mikotaj',
  'pages/employee/EmployeeTransactionHistoryPage': 'mikotaj',
  'pages/employee/GlobalLedgerPage': 'mikotaj',
  'pages/employee/LimitManagementPage': 'mikotaj',
}

/** Backend package ownership (mirrors Java package-info) */
export const BACKEND_PACKAGES = {
  'com.trustus.bank.auth': 'wesley',
  'com.trustus.bank.security': 'wesley',
  'com.trustus.bank.account': 'darlington',
  'com.trustus.bank.transfer': 'mikotaj',
}
