import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')

const AUTHORS = {
  wesley: 'Wesley (Dev 1 — Gatekeeper)',
  darlington: 'Darlington (Dev 2 — Teller)',
  mikotaj: 'Mikotaj (Dev 3 — Auditor)',
  shared: 'Wesley, Darlington, Mikotaj (shared)',
}

function authorForJava(relPath) {
  const p = relPath.replace(/\\/g, '/')
  const base = path.basename(p, '.java')

  const wesley = new Set([
    'AuthController', 'AuthService', 'CustomerApprovalService',
    'User', 'Customer', 'UserRepository', 'CustomerRepository',
    'LoginRequest', 'LoginResponse', 'RegistrationRequest', 'RegistrationResponse',
    'ApprovalRequest', 'CustomerSummaryDto',
  ])
  const darlington = new Set([
    'AccountController', 'AccountService', 'Account', 'AccountRepository',
    'AccountDto', 'AtmTransactionRequest', 'CustomerDashboardDto',
    'CustomerDirectoryEntryDto', 'InternalTransferRequest',
  ])
  const mikotaj = new Set([
    'TransferController', 'HealthController', 'TransferService', 'TransactionService', 'LimitService',
    'Transaction', 'TransactionRepository',
    'CustomerLimitsDto', 'ExternalTransferRequest', 'TransactionDto', 'UpdateLimitsRequest',
  ])

  if (p.includes('/security/')) return AUTHORS.wesley
  if (wesley.has(base)) return AUTHORS.wesley
  if (darlington.has(base)) return AUTHORS.darlington
  if (mikotaj.has(base)) return AUTHORS.mikotaj
  if (p.includes('/config/')) return AUTHORS.mikotaj
  if (p.includes('/common/')) return AUTHORS.mikotaj
  if (p.endsWith('TrustusBankApplication.java')) return AUTHORS.mikotaj
  if (p.includes('/test/') && base === 'AuthControllerTest') return AUTHORS.wesley
  if (p.includes('/test/') && base === 'LimitServiceTest') return AUTHORS.mikotaj
  if (p.includes('/test/')) return AUTHORS.mikotaj
  return AUTHORS.shared
}

function authorForFrontend(relPath) {
  const p = relPath.replace(/\\/g, '/')
  if (p.startsWith('frontend/src/views/auth/')) return AUTHORS.wesley
  if (p.includes('/views/employee/ApprovalQueuePage')) return AUTHORS.wesley
  if (p.includes('/views/employee/AccountClosurePage')) return AUTHORS.wesley
  if (p.startsWith('frontend/src/views/account/')) return AUTHORS.darlington
  if (p.includes('/views/employee/EmployeeCustomersPage')) return AUTHORS.darlington
  if (p.startsWith('frontend/src/views/transfer/')) return AUTHORS.mikotaj
  if (p.includes('/views/employee/EmployeeTransferPage')) return AUTHORS.mikotaj
  if (p.includes('/views/employee/EmployeeTransactionHistoryPage')) return AUTHORS.mikotaj
  if (p.includes('/views/employee/GlobalLedgerPage')) return AUTHORS.mikotaj
  if (p.includes('/views/employee/LimitManagementPage')) return AUTHORS.mikotaj
  if (p === 'frontend/src/services/client.js') return AUTHORS.wesley
  return AUTHORS.shared
}

function walk(dir, ext, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'target') {
      walk(full, ext, files)
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      files.push(full)
    }
  }
  return files
}

function upsertJavaAuthor(content, author) {
  if (content.match(/^\/\*\* @summary .+\*\/\n/)) {
    content = content.replace(
      /^\/\*\* @summary (.+)\*\/\n/,
      `/**\n * @summary $1\n * @author ${author}\n */\n`
    )
  } else if (content.match(/^\/\*\* @summary/m)) {
    content = content.replace(/^\/\*\* @summary (.+)/m, `/**\n * @summary $1`)
    if (!content.includes('@author')) {
      content = content.replace(/^(\/\*\*[\s\S]*?)(\*\/\npackage )/m, `$1 * @author ${author}\n $2`)
    }
  }

  // Remove redundant class-level author-only or owner-prose blocks.
  content = content.replace(
    /\n\/\*\*\n \* @author [^\n]+\n \*\/\n(?=@|\w)/g,
    '\n'
  )
  content = content.replace(
    /\n\/\*\*\n \* (?:Wesley|Mikotaj|Darlington)[^\n]*\n \*\/\n(?=@|\w)/g,
    '\n'
  )
  content = content.replace(
    /\n\/\*\*\n \* REST API for auth[^\n]*\n \*\n \* @author [^\n]+\n \*\/\n(?=@RestController)/,
    '\n'
  )
  content = content.replace(
    /\n\/\*\*\n \* Customer accounts[^\n]*\n \*\n \* @author [^\n]+\n \*\/\n(?=@RestController)/,
    '\n'
  )
  content = content.replace(
    /\n\/\*\*\n \* External transfers[^\n]*\n \*\n \* @author [^\n]+\n \*\/\n(?=@RestController)/,
    '\n'
  )

  if (!content.includes('@author')) {
    content = content.replace(/^(\/\*\*[\s\S]*?)(\*\/\npackage )/m, `$1 * @author ${author}\n $2`)
  }

  return content
}

function upsertFrontendAuthor(content, author) {
  const summaryMatch = content.match(/^\/\/ @summary (.+)\n/)
  const blockMatch = content.match(/^\/\*\*\n \* @summary ([^\n]+)\n(?: \* @author [^\n]+\n)? \*\/\n/)

  let summary = ''
  if (summaryMatch) summary = summaryMatch[1]
  else if (blockMatch) summary = blockMatch[1]
  else summary = 'Application module.'

  content = content
    .replace(/^\/\/ @summary .+\n/, '')
    .replace(/^\/\/ Owner: .+\n/, '')
    .replace(/^\/\*\*\n \* @summary [^\n]+\n(?: \* @author [^\n]+\n)? \*\/\n/, '')

  const block = `/**\n * @summary ${summary}\n * @author ${author}\n */\n`
  return block + content
}

function upsertPackageInfoAuthor(content, author) {
  if (content.includes('@author')) {
    return content.replace(/\n \* @author [^\n]+/, `\n * @author ${author}`)
  }
  return content.replace(/^(\/\*\*[\s\S]*?)(\*\/\npackage )/m, `$1 * @author ${author}\n $2`)
}

let updated = 0

for (const file of walk(path.join(root, 'backend/src'), '.java')) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  const author = authorForJava(rel)
  const next = upsertJavaAuthor(fs.readFileSync(file, 'utf8'), author)
  if (next !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, next)
    updated++
  }
}

for (const file of walk(path.join(root, 'frontend/src'), '.jsx').concat(walk(path.join(root, 'frontend/src'), '.js'))) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  const author = authorForFrontend(rel)
  const original = fs.readFileSync(file, 'utf8')
  const next = upsertFrontendAuthor(original, author)
  if (next !== original) {
    fs.writeFileSync(file, next)
    updated++
  }
}

console.log(`Updated ${updated} files with @author tags.`)

// Verify coverage
let missing = []
for (const file of walk(path.join(root, 'backend/src'), '.java')) {
  if (!fs.readFileSync(file, 'utf8').includes('@author')) missing.push(path.relative(root, file))
}
for (const file of walk(path.join(root, 'frontend/src'), '.jsx').concat(walk(path.join(root, 'frontend/src'), '.js'))) {
  if (!fs.readFileSync(file, 'utf8').includes('@author')) missing.push(path.relative(root, file))
}
if (missing.length) {
  console.error('Missing @author:', missing.join('\n'))
  process.exit(1)
}
