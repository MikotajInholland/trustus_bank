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
  if (p.includes('/auth/')) return AUTHORS.wesley
  if (p.includes('/security/')) return AUTHORS.wesley
  if (p.includes('/account/')) return AUTHORS.darlington
  if (p.includes('/transfer/')) return AUTHORS.mikotaj
  if (p.includes('/config/')) return AUTHORS.mikotaj
  if (p.includes('/common/')) return AUTHORS.mikotaj
  if (p.includes('/domain/user/')) return AUTHORS.wesley
  if (p.includes('/domain/customer/')) return AUTHORS.wesley
  if (p.includes('/domain/account/')) return AUTHORS.darlington
  if (p.includes('/domain/transaction/')) return AUTHORS.mikotaj
  if (p.endsWith('TrustusBankApplication.java')) return AUTHORS.mikotaj
  if (p.includes('/test/') && p.includes('/auth/')) return AUTHORS.wesley
  if (p.includes('/test/') && p.includes('/transfer/')) return AUTHORS.mikotaj
  if (p.includes('/test/')) return AUTHORS.mikotaj
  return AUTHORS.shared
}

const frontendAuthors = {
  'frontend/src/pages/auth/LoginPage.jsx': AUTHORS.wesley,
  'frontend/src/pages/auth/RegisterPage.jsx': AUTHORS.wesley,
  'frontend/src/pages/auth/WaitingPage.jsx': AUTHORS.wesley,
  'frontend/src/pages/account/DashboardPage.jsx': AUTHORS.darlington,
  'frontend/src/pages/account/AtmLoginPage.jsx': AUTHORS.darlington,
  'frontend/src/pages/account/AtmPage.jsx': AUTHORS.darlington,
  'frontend/src/pages/account/InternalTransfersPage.jsx': AUTHORS.darlington,
  'frontend/src/pages/transfer/TransfersPage.jsx': AUTHORS.mikotaj,
  'frontend/src/pages/transfer/TransactionsPage.jsx': AUTHORS.mikotaj,
  'frontend/src/pages/employee/ApprovalQueuePage.jsx': AUTHORS.wesley,
  'frontend/src/pages/employee/AccountClosurePage.jsx': AUTHORS.wesley,
  'frontend/src/pages/employee/EmployeeCustomersPage.jsx': AUTHORS.darlington,
  'frontend/src/pages/employee/EmployeeTransferPage.jsx': AUTHORS.mikotaj,
  'frontend/src/pages/employee/EmployeeTransactionHistoryPage.jsx': AUTHORS.mikotaj,
  'frontend/src/pages/employee/GlobalLedgerPage.jsx': AUTHORS.mikotaj,
  'frontend/src/pages/employee/LimitManagementPage.jsx': AUTHORS.mikotaj,
  'frontend/src/components/TransactionTable.jsx': AUTHORS.mikotaj,
  'frontend/src/components/TransactionFilters.jsx': AUTHORS.mikotaj,
  'frontend/src/context/AuthContext.jsx': AUTHORS.wesley,
  'frontend/src/api/client.js': AUTHORS.wesley,
}

function authorForFrontend(relPath) {
  const key = relPath.replace(/\\/g, '/')
  return frontendAuthors[key] ?? AUTHORS.shared
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

for (const pkg of [
  'backend/src/main/java/com/trustus/bank/auth/package-info.java',
  'backend/src/main/java/com/trustus/bank/account/package-info.java',
  'backend/src/main/java/com/trustus/bank/transfer/package-info.java',
]) {
  const file = path.join(root, pkg)
  const author = authorForJava(pkg)
  const original = fs.readFileSync(file, 'utf8')
  const next = upsertPackageInfoAuthor(original, author)
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
