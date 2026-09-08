import fs from 'node:fs';
import { parseEnv } from 'node:util';
import { randomBytes } from 'node:crypto';
if (fs.existsSync('.env.local')) {
  console.log('.env.local já existe; configuração preservada.');
} else {
  const old = parseEnv(fs.readFileSync('legacy-backend/.env', 'utf8'));
  const quote = value => JSON.stringify(value || '');
  fs.writeFileSync('.env.local', [
    `SUPABASE_URL=${quote(old.SUPABASE_URL)}`,
    `NEXT_PUBLIC_SUPABASE_URL=${quote(old.SUPABASE_URL)}`,
    `SUPABASE_SECRET_KEY=${quote(old.SUPABASE_SECRET_KEY || old.SUPABASE_SERVICE_ROLE_KEY)}`,
    `JWT_SECRET=${quote(old.JWT_SECRET || randomBytes(48).toString('hex'))}`,
    '',
  ].join('\n'), { flag: 'wx' });
  console.log('Configuração antiga copiada para .env.local; nenhuma chave foi exibida.');
}
