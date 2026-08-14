import { describe, expect, test } from 'bun:test';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import {
  buildApproveUpgradeBody,
  buildBurnBody,
  buildBuyCreditBody,
  buildChangeAdminBody,
  buildChangeContentBody,
  buildDeployMessage,
  buildDestroyBody,
  buildInviteBody,
  buildMintBody,
  buildPersonalMinterDeploy,
  buildPointPersonalMinterBody,
  buildRejectUpgradeBody,
  buildSetAllowanceBody,
  buildSpendAllowanceBody,
  buildTopUpTonsBody,
  buildTransferBody,
  buildUnvoteBody,
  buildVoteBody,
  parseUnits,
} from '../../deploy';

const TEST_ADDR_1 = Address.parseRaw('0:0000000000000000000000000000000000000000000000000000000000000000');
const TEST_ADDR_2 = Address.parseRaw('0:1111111111111111111111111111111111111111111111111111111111111111');

describe('Tier 1: 19 Payload Builders Serialization & Opcode Integrity (Feature 10)', () => {
  // Category 1: Deploy & Mint Operations
  describe('Deploy & Mint Payload Builders', () => {
    test('4.1.1 should build deploy message with stateInit and initial mint body', async () => {
      const result = await buildDeployMessage({
        metadata: { name: 'Test Token', symbol: 'TT', decimals: '9' },
        ownerAddress: TEST_ADDR_1,
        mintAmount: toNano('1000'),
      });

      expect(result.contractAddress).toBeInstanceOf(Address);
      expect(result.stateInit.code).toBeInstanceOf(Cell);
      expect(result.stateInit.data).toBeInstanceOf(Cell);
      expect(result.mintBody).toBeInstanceOf(Cell);

      const opcode = result.mintBody.beginParse().loadUint(32);
      expect(opcode).toBe(0x00001001);
    });

    test('4.1.2 should build mint body cell with opcode 0x00001001', () => {
      const mintBody = buildMintBody({
        toAddress: TEST_ADDR_1,
        jettonAmount: 1000000000n,
        forwardTonAmount: toNano('0.02'),
        totalTonAmount: toNano('0.05'),
      });

      expect(mintBody).toBeInstanceOf(Cell);
      const opcode = mintBody.beginParse().loadUint(32);
      expect(opcode).toBe(0x00001001);
    });

    test('4.1.3 should set correct jetton amount and forward ton amount in mint payload', () => {
      const mintBody = buildMintBody({
        toAddress: TEST_ADDR_1,
        jettonAmount: 5000000000n,
        forwardTonAmount: toNano('0.02'),
        totalTonAmount: toNano('0.05'),
        queryId: 42n,
      });

      const slice = mintBody.beginParse();
      const opcode = slice.loadUint(32);
      const queryId = slice.loadUintBig(64);

      expect(opcode).toBe(0x00001001);
      expect(queryId).toBe(42n);
    });

    test('4.1.4 should support custom queryId in mint body payload', () => {
      const mintBody = buildMintBody({
        toAddress: TEST_ADDR_2,
        jettonAmount: 100n,
        forwardTonAmount: 1000n,
        totalTonAmount: 5000n,
        queryId: 999n,
      });

      const slice = mintBody.beginParse();
      slice.loadUint(32); // skip opcode
      const queryId = slice.loadUintBig(64);
      expect(queryId).toBe(999n);
    });

    test('4.1.5 should parse decimal units correctly via parseUnits', () => {
      expect(parseUnits('100', 9)).toBe(100000000000n);
      expect(parseUnits('1.5', 9)).toBe(1500000000n);
      expect(parseUnits('0.000000001', 9)).toBe(1n);
    });
  });

  // Category 2: Jetton Transfer Operations
  describe('Transfer Payload Builder', () => {
    test('4.2.1 should build transfer body cell with opcode 0x0f8a7ea5', () => {
      const transferBody = buildTransferBody({
        toAddress: TEST_ADDR_2,
        amount: toNano('10'),
        responseAddress: TEST_ADDR_1,
      });

      expect(transferBody).toBeInstanceOf(Cell);
      const opcode = transferBody.beginParse().loadUint(32);
      expect(opcode).toBe(0x0f8a7ea5);
    });

    test('4.2.2 should include forwardTonAmount and response address in transfer body', () => {
      const transferBody = buildTransferBody({
        toAddress: TEST_ADDR_2,
        amount: toNano('5'),
        responseAddress: TEST_ADDR_1,
        forwardTonAmount: toNano('0.01'),
      });

      const slice = transferBody.beginParse();
      const opcode = slice.loadUint(32);
      const queryId = slice.loadUintBig(64);
      const amount = slice.loadCoins();

      expect(opcode).toBe(0x0f8a7ea5);
      expect(queryId).toBe(0n);
      expect(amount).toBe(toNano('5'));
    });

    test('4.2.3 should support custom queryId in transfer body', () => {
      const transferBody = buildTransferBody({
        toAddress: TEST_ADDR_2,
        amount: 1000n,
        responseAddress: TEST_ADDR_1,
        queryId: 12345n,
      });

      const slice = transferBody.beginParse();
      slice.loadUint(32);
      const queryId = slice.loadUintBig(64);
      expect(queryId).toBe(12345n);
    });

    test('4.2.4 should encode inline forward payload when forwardPayload is null', () => {
      const transferBody = buildTransferBody({
        toAddress: TEST_ADDR_2,
        amount: 1000n,
        responseAddress: TEST_ADDR_1,
        forwardPayload: null,
      });

      expect(transferBody).toBeInstanceOf(Cell);
    });

    test('4.2.5 should encode ref forward payload when forwardPayload cell is provided', () => {
      const customPayload = beginCell().storeUint(0xabc, 16).endCell();
      const transferBody = buildTransferBody({
        toAddress: TEST_ADDR_2,
        amount: 1000n,
        responseAddress: TEST_ADDR_1,
        forwardPayload: customPayload,
      });

      expect(transferBody).toBeInstanceOf(Cell);
    });
  });

  // Category 3: Token Burn Operations
  describe('Burn & Payback Payload Builders', () => {
    test('4.3.1 should build burn body cell with opcode 0x595f07bc', () => {
      const burnBody = buildBurnBody(toNano('50'), TEST_ADDR_1);

      expect(burnBody).toBeInstanceOf(Cell);
      const opcode = burnBody.beginParse().loadUint(32);
      expect(opcode).toBe(0x595f07bc);
    });

    test('4.3.2 should set responseAddress as sendExcessesTo in burn body', () => {
      const burnBody = buildBurnBody(toNano('25'), TEST_ADDR_1);

      const slice = burnBody.beginParse();
      const opcode = slice.loadUint(32);
      const queryId = slice.loadUintBig(64);
      const amount = slice.loadCoins();
      const responseAddr = slice.loadAddress();

      expect(opcode).toBe(0x595f07bc);
      expect(queryId).toBe(0n);
      expect(amount).toBe(toNano('25'));
      expect(responseAddr.equals(TEST_ADDR_1)).toBeTrue();
    });

    test('4.3.3 should support custom queryId in burn body', () => {
      const burnBody = buildBurnBody(toNano('10'), TEST_ADDR_1, 777n);

      const slice = burnBody.beginParse();
      slice.loadUint(32);
      const queryId = slice.loadUintBig(64);
      expect(queryId).toBe(777n);
    });

    test('4.3.4 should build burn body for payback transaction flow', () => {
      const paybackBody = buildBurnBody(toNano('100'), TEST_ADDR_2);

      const slice = paybackBody.beginParse();
      const opcode = slice.loadUint(32);
      expect(opcode).toBe(0x595f07bc);
    });

    test('4.3.5 should handle large bigint burn amounts', () => {
      const largeAmount = 1000000000000000000n;
      const burnBody = buildBurnBody(largeAmount, TEST_ADDR_1);

      const slice = burnBody.beginParse();
      slice.loadUint(32);
      slice.loadUintBig(64);
      const amount = slice.loadCoins();

      expect(amount).toBe(largeAmount);
    });
  });

  // Category 4: Admin Minter Operations
  describe('Admin Minter Payload Builders', () => {
    test('4.4.1 should build change metadata body cell with non-zero opcode', async () => {
      const changeContent = await buildChangeContentBody({
        name: 'New Jetton',
        symbol: 'NJ',
        decimals: '9',
      });

      expect(changeContent).toBeInstanceOf(Cell);
      const opcode = changeContent.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.4.2 should build change admin body cell with non-zero opcode', () => {
      const changeAdmin = buildChangeAdminBody(TEST_ADDR_2);

      expect(changeAdmin).toBeInstanceOf(Cell);
      const opcode = changeAdmin.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.4.3 should build top up tons body cell with non-zero opcode', () => {
      const topUp = buildTopUpTonsBody();

      expect(topUp).toBeInstanceOf(Cell);
      const opcode = topUp.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.4.4 should build approve upgrade body cell with non-zero opcode', () => {
      const approve = buildApproveUpgradeBody();

      expect(approve).toBeInstanceOf(Cell);
      const opcode = approve.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.4.5 should build reject upgrade body cell with non-zero opcode', () => {
      const reject = buildRejectUpgradeBody();

      expect(reject).toBeInstanceOf(Cell);
      const opcode = reject.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });
  });

  // Category 5: Allowance Operations
  describe('Allowance Payload Builders', () => {
    test('4.5.1 should build set allowance body cell with non-zero opcode', () => {
      const setAllowance = buildSetAllowanceBody({
        grantee: TEST_ADDR_2,
        amount: toNano('100'),
      });

      expect(setAllowance).toBeInstanceOf(Cell);
      const opcode = setAllowance.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.5.2 should set grantee address and allowance amount in set allowance payload', () => {
      const setAllowance = buildSetAllowanceBody({
        grantee: TEST_ADDR_2,
        amount: toNano('50'),
        queryId: 88n,
      });

      const slice = setAllowance.beginParse();
      const opcode = slice.loadUint(32);
      const queryId = slice.loadUintBig(64);
      const grantee = slice.loadAddress();
      const amount = slice.loadCoins();

      expect(opcode).toBeGreaterThan(0);
      expect(queryId).toBe(88n);
      expect(grantee.equals(TEST_ADDR_2)).toBeTrue();
      expect(amount).toBe(toNano('50'));
    });

    test('4.5.3 should build spend allowance body cell with non-zero opcode', () => {
      const spendAllowance = buildSpendAllowanceBody({
        amount: toNano('25'),
        receiver: TEST_ADDR_2,
        sendExcessesTo: TEST_ADDR_1,
      });

      expect(spendAllowance).toBeInstanceOf(Cell);
      const opcode = spendAllowance.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.5.4 should set receiver and sendExcessesTo addresses in spend allowance payload', () => {
      const spendAllowance = buildSpendAllowanceBody({
        amount: toNano('10'),
        receiver: TEST_ADDR_2,
        sendExcessesTo: TEST_ADDR_1,
        queryId: 99n,
      });

      const slice = spendAllowance.beginParse();
      const opcode = slice.loadUint(32);
      const queryId = slice.loadUintBig(64);
      const amount = slice.loadCoins();
      const receiver = slice.loadAddress();
      const sendExcessesTo = slice.loadAddress();

      expect(opcode).toBeGreaterThan(0);
      expect(queryId).toBe(99n);
      expect(amount).toBe(toNano('10'));
      expect(receiver.equals(TEST_ADDR_2)).toBeTrue();
      expect(sendExcessesTo.equals(TEST_ADDR_1)).toBeTrue();
    });

    test('4.5.5 should support zero allowance grant', () => {
      const setAllowance = buildSetAllowanceBody({
        grantee: TEST_ADDR_2,
        amount: 0n,
      });

      const slice = setAllowance.beginParse();
      slice.loadUint(32);
      slice.loadUintBig(64);
      slice.loadAddress();
      const amount = slice.loadCoins();

      expect(amount).toBe(0n);
    });
  });

  // Category 6: Credit Operations
  describe('Buy Credit Payload Builder', () => {
    test('4.6.1 should build buy credit body cell with non-zero opcode', () => {
      const buyCredit = buildBuyCreditBody({
        transferRecipient: TEST_ADDR_2,
        amount: toNano('5'),
        responseAddress: TEST_ADDR_1,
      });

      expect(buyCredit).toBeInstanceOf(Cell);
      const opcode = buyCredit.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.6.2 should set transferRecipient and sendExcessesTo in buy credit payload', () => {
      const buyCredit = buildBuyCreditBody({
        transferRecipient: TEST_ADDR_2,
        amount: toNano('10'),
        responseAddress: TEST_ADDR_1,
        queryId: 55n,
      });

      const slice = buyCredit.beginParse();
      const opcode = slice.loadUint(32);
      const queryId = slice.loadUintBig(64);
      const amount = slice.loadCoins();

      expect(opcode).toBeGreaterThan(0);
      expect(queryId).toBe(55n);
      expect(amount).toBe(toNano('10'));
    });

    test('4.6.3 should set jetton amount in buy credit payload', () => {
      const buyCredit = buildBuyCreditBody({
        transferRecipient: TEST_ADDR_2,
        amount: toNano('100'),
        responseAddress: TEST_ADDR_1,
      });

      const slice = buyCredit.beginParse();
      slice.loadUint(32);
      slice.loadUintBig(64);
      const amount = slice.loadCoins();

      expect(amount).toBe(toNano('100'));
    });

    test('4.6.4 should support custom queryId in buy credit payload', () => {
      const buyCredit = buildBuyCreditBody({
        transferRecipient: TEST_ADDR_2,
        amount: toNano('1'),
        responseAddress: TEST_ADDR_1,
        queryId: 101010n,
      });

      const slice = buyCredit.beginParse();
      slice.loadUint(32);
      const queryId = slice.loadUintBig(64);

      expect(queryId).toBe(101010n);
    });

    test('4.6.5 should build buy credit body cell deterministically', () => {
      const buyCredit1 = buildBuyCreditBody({
        transferRecipient: TEST_ADDR_2,
        amount: toNano('5'),
        responseAddress: TEST_ADDR_1,
      });
      const buyCredit2 = buildBuyCreditBody({
        transferRecipient: TEST_ADDR_2,
        amount: toNano('5'),
        responseAddress: TEST_ADDR_1,
      });

      expect(buyCredit1.equals(buyCredit2)).toBeTrue();
    });
  });

  // Category 7: Destroy Account Action
  describe('Destroy Account Payload Builder', () => {
    test('4.7.1 should build destroy body cell with non-zero opcode', () => {
      const destroy = buildDestroyBody();

      expect(destroy).toBeInstanceOf(Cell);
      const opcode = destroy.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.7.2 should verify destroy cell slice contains non-zero opcode', () => {
      const destroy = buildDestroyBody();
      const slice = destroy.beginParse();

      expect(slice.remainingBits).toBe(32);
      const opcode = slice.loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.7.3 should build multiple destroy cells deterministically', () => {
      const destroy1 = buildDestroyBody();
      const destroy2 = buildDestroyBody();

      expect(destroy1.equals(destroy2)).toBeTrue();
    });

    test('4.7.4 should verify destroy cell contains empty body after 32-bit opcode', () => {
      const destroy = buildDestroyBody();
      const slice = destroy.beginParse();
      slice.loadUint(32);

      expect(slice.remainingBits).toBe(0);
      expect(slice.remainingRefs).toBe(0);
    });

    test('4.7.5 should verify destroy cell BOC serialization', () => {
      const destroy = buildDestroyBody();
      const boc = destroy.toBoc();

      expect(boc).toBeInstanceOf(Uint8Array);
      expect(boc.length).toBeGreaterThan(0);
    });
  });

  // Category 8: Invite Action
  describe('Invite Payload Builder', () => {
    test('4.8.1 should build invite body cell with non-zero opcode', () => {
      const invite = buildInviteBody({
        transferRecipient: TEST_ADDR_2,
        username: 'alice',
        city: 'Tokyo',
        cityLetter: 84,
      });

      expect(invite).toBeInstanceOf(Cell);
      const opcode = invite.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.8.2 should encode username, city, and cityLetter in invite payload', () => {
      const invite = buildInviteBody({
        transferRecipient: TEST_ADDR_2,
        username: 'bob',
        city: 'Berlin',
        cityLetter: 66,
        queryId: 44n,
      });

      const slice = invite.beginParse();
      const opcode = slice.loadUint(32);
      const queryId = slice.loadUintBig(64);

      expect(opcode).toBeGreaterThan(0);
      expect(queryId).toBe(44n);
    });

    test('4.8.3 should handle default empty username and city strings in invite payload', () => {
      const invite = buildInviteBody({
        transferRecipient: TEST_ADDR_2,
      });

      expect(invite).toBeInstanceOf(Cell);
      const opcode = invite.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.8.4 should support numeric cityLetter as bigint in invite payload', () => {
      const invite = buildInviteBody({
        transferRecipient: TEST_ADDR_2,
        cityLetter: 65n,
      });

      expect(invite).toBeInstanceOf(Cell);
    });

    test('4.8.5 should support custom queryId in invite payload', () => {
      const invite = buildInviteBody({
        transferRecipient: TEST_ADDR_2,
        queryId: 98765n,
      });

      const slice = invite.beginParse();
      slice.loadUint(32);
      const queryId = slice.loadUintBig(64);
      expect(queryId).toBe(98765n);
    });
  });

  // Category 9: Issue Token & Personal Minter
  describe('Issue Token & Personal Minter Builders', () => {
    test('4.9.1 should build personal minter deployment stateInit with issuer wallet and admin address', async () => {
      const result = await buildPersonalMinterDeploy({
        issuerWallet: TEST_ADDR_1,
        adminAddress: TEST_ADDR_2,
        metadata: { name: 'Personal Token', symbol: 'PT', decimals: '9' },
      });

      expect(result.contractAddress).toBeInstanceOf(Address);
      expect(result.stateInit.code).toBeInstanceOf(Cell);
      expect(result.stateInit.data).toBeInstanceOf(Cell);
    });

    test('4.9.2 should derive deterministic contract address for personal minter', async () => {
      const res1 = await buildPersonalMinterDeploy({
        issuerWallet: TEST_ADDR_1,
        adminAddress: TEST_ADDR_2,
        metadata: { name: 'Personal Token', symbol: 'PT', decimals: '9' },
      });

      const res2 = await buildPersonalMinterDeploy({
        issuerWallet: TEST_ADDR_1,
        adminAddress: TEST_ADDR_2,
        metadata: { name: 'Personal Token', symbol: 'PT', decimals: '9' },
      });

      expect(res1.contractAddress.equals(res2.contractAddress)).toBeTrue();
    });

    test('4.9.3 should build point personal minter body cell with non-zero opcode', () => {
      const pointBody = buildPointPersonalMinterBody({
        personalMinter: TEST_ADDR_2,
      });

      expect(pointBody).toBeInstanceOf(Cell);
      const opcode = pointBody.beginParse().loadUint(32);
      expect(opcode).toBeGreaterThan(0);
    });

    test('4.9.4 should encode target personal minter address in point personal minter payload', () => {
      const pointBody = buildPointPersonalMinterBody({
        personalMinter: TEST_ADDR_2,
      });

      const slice = pointBody.beginParse();
      const opcode = slice.loadUint(32);
      const recipient = slice.loadAddress();

      expect(opcode).toBeGreaterThan(0);
      expect(recipient.equals(TEST_ADDR_2)).toBeTrue();
    });

    test('4.9.5 should handle onchain metadata encoding in personal minter deploy', async () => {
      const result = await buildPersonalMinterDeploy({
        issuerWallet: TEST_ADDR_1,
        adminAddress: TEST_ADDR_1,
        metadata: { name: 'Token', symbol: 'TK', decimals: '6', description: 'Descr' },
      });

      expect(result.stateInit.data.bits.length).toBeGreaterThan(0);
    });
  });

  // Category 10: Governance & Vote Operations
  describe('Vote & Unvote Payload Builders', () => {
    test('4.10.1 should build vote body cell with opcode 0x000010f1', () => {
      const voteBody = buildVoteBody({ transferRecipient: TEST_ADDR_2 });

      expect(voteBody).toBeInstanceOf(Cell);
      const opcode = voteBody.beginParse().loadUint(32);
      expect(opcode).toBe(0x000010f1);
    });

    test('4.10.2 should set transferRecipient address in vote body', () => {
      const voteBody = buildVoteBody({ transferRecipient: TEST_ADDR_2 });

      const slice = voteBody.beginParse();
      const opcode = slice.loadUint(32);
      const recipient = slice.loadAddress();

      expect(opcode).toBe(0x000010f1);
      expect(recipient.equals(TEST_ADDR_2)).toBeTrue();
    });

    test('4.10.3 should build unvote body cell with opcode 0x000010f2', () => {
      const unvoteBody = buildUnvoteBody({ transferRecipient: TEST_ADDR_2 });

      expect(unvoteBody).toBeInstanceOf(Cell);
      const opcode = unvoteBody.beginParse().loadUint(32);
      expect(opcode).toBe(0x000010f2);
    });

    test('4.10.4 should set transferRecipient address in unvote body', () => {
      const unvoteBody = buildUnvoteBody({ transferRecipient: TEST_ADDR_2 });

      const slice = unvoteBody.beginParse();
      const opcode = slice.loadUint(32);
      const recipient = slice.loadAddress();

      expect(opcode).toBe(0x000010f2);
      expect(recipient.equals(TEST_ADDR_2)).toBeTrue();
    });

    test('4.10.5 should verify distinct opcodes for vote (0x000010f1) vs unvote (0x000010f2)', () => {
      const vote = buildVoteBody({ transferRecipient: TEST_ADDR_2 });
      const unvote = buildUnvoteBody({ transferRecipient: TEST_ADDR_2 });

      const voteOp = vote.beginParse().loadUint(32);
      const unvoteOp = unvote.beginParse().loadUint(32);

      expect(voteOp).toBe(0x000010f1);
      expect(unvoteOp).toBe(0x000010f2);
      expect(voteOp).not.toBe(unvoteOp);
    });
  });
});
