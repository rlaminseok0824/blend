import { readFileSync } from 'node:fs';

const page = readFileSync('src/app/admin/page.tsx', 'utf8');
const client = readFileSync('src/shared/api/client.ts', 'utf8');
const source = `${page}\n${client}`;
const required = [
  "'/api/v1/user/me'",
  "'/api/v1/admin/resume/status'",
  'data-testid="admin-login"',
  'data-testid="admin-forbidden"',
  'data-testid="admin-dashboard"',
  'https://tteokyi.com/?lang=',
  'target="_blank"',
  "startsWith('/api/v1/resume/pdf/')",
  'verificationError || !verifiedUser',
  'setVerificationError(false)',
  'payload?.error',
  'response.status === 403 ? 5004 : 5000',
  'aria-pressed',
];
for (const fragment of required) {
  if (!source.includes(fragment)) throw new Error(`missing admin assertion: ${fragment}`);
}
for (const forbidden of ['regenerate', 'rollback', 'publish', 'draft']) {
  if (page.toLowerCase().includes(forbidden)) throw new Error(`admin must remain read-only: ${forbidden}`);
}
console.log('admin static assertions passed');
