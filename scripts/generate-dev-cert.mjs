import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CERT_DIR = join(ROOT, '.cert');
const KEY_FILE = join(CERT_DIR, 'dev-key.pem');
const CERT_FILE = join(CERT_DIR, 'dev-cert.pem');

export function getLocalIpAddresses() {
  const ips = [];
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

export function generateDevCert() {
  if (existsSync(KEY_FILE) && existsSync(CERT_FILE)) {
    console.log('[dev-cert] Existing self-signed certificate found in .cert/');
    return { keyFile: KEY_FILE, certFile: CERT_FILE };
  }

  if (!existsSync(CERT_DIR)) {
    mkdirSync(CERT_DIR, { recursive: true });
  }

  const localIps = getLocalIpAddresses();
  const sanEntries = [
    'DNS:localhost',
    'IP:127.0.0.1',
    'IP:0.0.0.0',
    ...localIps.map((ip) => `IP:${ip}`),
  ];

  const configContent = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = US
ST = Dev
L = Local
O = BrotherHood
OU = Development
CN = localhost

[v3_req]
subjectAltName = ${sanEntries.join(',')}
basicConstraints = CA:TRUE
keyUsage = digitalSignature, keyEncipherment, keyCertSign
extendedKeyUsage = serverAuth
`;

  const configPath = join(CERT_DIR, 'openssl.cnf');
  writeFileSync(configPath, configContent.trim(), 'utf8');

  console.log(
    '[dev-cert] Generating self-signed TLS certificate with SAN entries:',
  );
  for (const san of sanEntries) {
    console.log(`  - ${san}`);
  }

  try {
    execFileSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-sha256',
        '-days',
        '365',
        '-keyout',
        KEY_FILE,
        '-out',
        CERT_FILE,
        '-config',
        configPath,
      ],
      { stdio: 'inherit' },
    );
    console.log('[dev-cert] Certificate successfully generated:');
    console.log(`  Key:  ${KEY_FILE}`);
    console.log(`  Cert: ${CERT_FILE}`);
    console.log('\nTip for mobile testing:');
    console.log(
      '  When visiting https://<your-lan-ip>:3000 on your phone, bypass the self-signed warning once.',
    );
    console.log(
      '  WebAuthn (fingerprint unlock) will then work in the browser!\n',
    );
  } catch (err) {
    console.error(
      '[dev-cert] Failed to generate certificate via openssl:',
      err,
    );
    throw err;
  }

  return { keyFile: KEY_FILE, certFile: CERT_FILE };
}

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateDevCert();
}
