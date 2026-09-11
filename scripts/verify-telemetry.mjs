import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    executablePath: '/home/zeta/.nix-profile/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const networkEvents = [];
  page.on('request', async (req) => {
    const url = req.url();
    if (
      url.includes('toncenter.com') ||
      url.includes('tonapi.io') ||
      url.includes('runGetMethod') ||
      url.includes('accountStates')
    ) {
      let postData = '';
      if (req.method() === 'POST') {
        try {
          const parsed = JSON.parse(req.postData() || '{}');
          postData = ` (method: ${parsed.method}, params: ${JSON.stringify(parsed.params)})`;
        } catch {
          postData = ` (body: ${req.postData()?.slice(0, 100)})`;
        }
      }
      networkEvents.push({ method: req.method(), url, postData });
      console.log(`[NETWORK REQ] ${req.method()} ${url}${postData}`);
    }
  });

  // Seed localStorage with a test wallet and tracked personal tokens
  const testWallet =
    '0:94d1c009db43c5ecc5fd08b05c8d40b0e99c0e7d88a5d6288a59765e78195fbf';
  const trackedMinters = [
    'kQCU0cAJ20PF7MX9CLBcjUCw6ZwOfYil1iiKWXZeeBlfv1gP',
    'kQCSO85lkCo3PPpkedsVCD1KB3yyFVBAyGrbEPh7ltw9B_8M',
    'kQCS_CPuIBSklNNYJbSzGY13yGZdDteb2VYOrnuGEdV5w1NX',
  ];

  const encryptedMnemonic =
    'wy4R1xrT1TCytJBKOp1uHubI2CFalLxKj03vQUwHVVHUEVTo4Zt4T72sUWtYhQhVAqIsDzzXtHpxxUSGCO//3Hj9yZbbi9yLzlKOS707P0lxx2yv3/+78rqpMTtEcrOtvglmb/pHs23n2ap+CeSvOw5MZ8jx/cVlu7FrtqHd9JtWvGyK7IL8UsIHTW/yPNfk8zWX6mP986lspPV1Lxk/k3dlAg==';

  await page.addInitScript(
    ({ wallet, minters, encrypted }) => {
      try {
        localStorage.setItem(
          `brotherhood_tracked_personal_tokens_${wallet}`,
          JSON.stringify(minters),
        );
        const demoWalletStore = {
          state: {
            auth: {
              isPasswordSet: true,
              isUnlocked: true,
              persistPassword: true,
              currentPassword: 'Password123!',
              holdToSign: false,
              showFastSend: false,
              useWalletInterfaceType: 'mnemonic',
              ledgerAccountNumber: 0,
            },
            walletManagement: {
              hasWallet: true,
              activeWalletId: 'test-wallet-1',
              address: wallet,
              balance: '3987815020',
              savedWallets: [
                {
                  id: 'test-wallet-1',
                  name: 'Test Wallet',
                  address: wallet,
                  publicKey: 'ed25519_test',
                  walletType: 'mnemonic',
                  walletInterfaceType: 'mnemonic',
                  network: 'testnet',
                  encryptedMnemonic: encrypted,
                  createdAt: Date.now(),
                },
              ],
            },
          },
          version: 2,
        };
        localStorage.setItem(
          'demo-wallet-store',
          JSON.stringify(demoWalletStore),
        );
      } catch (e) {
        console.error('Init script error:', e);
      }
    },
    {
      wallet: testWallet,
      minters: trackedMinters,
      encrypted: encryptedMnemonic,
    },
  );

  console.log('Navigating to Assets screen...');
  await page.goto('http://localhost:3000/brotherhood/wallet/assets', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(4000);

  console.log('\nNavigating to City Network...');
  await page.goto('http://localhost:3000/brotherhood/city-network', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(4000);

  console.log('\nNavigating to Brotherhood Rings...');
  await page.goto('http://localhost:3000/brotherhood/manage?tab=network', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(4000);

  console.log('\n--- Summary of Blockchain Network Calls ---');
  const accountStatesCalls = networkEvents.filter((e) =>
    e.url.includes('accountStates'),
  );
  const runGetMethodCalls = networkEvents.filter(
    (e) =>
      e.url.includes('runGetMethod') ||
      (e.postData && e.postData.includes('runGetMethod')),
  );

  console.log(`Total accountStates batch calls: ${accountStatesCalls.length}`);
  accountStatesCalls.forEach((c) => console.log(`  -> ${c.url}`));
  console.log(
    `Total individual runGetMethod calls: ${runGetMethodCalls.length}`,
  );
  runGetMethodCalls.forEach((c) => console.log(`  -> ${c.url} ${c.postData}`));

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
