/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Page } from '@playwright/test';

/**
 * The screen reached right after setting a password for the "create" path —
 * the redesigned "Recovery phrase" (create-wallet) screen.
 */
export class SetupWalletPage {
  /** Hold-to-continue gesture duration on the save-phrase confirmation modal (ms). */
  private static readonly HOLD_DURATION = 1500;

  constructor(private readonly page: Page) {}

  get revealButton() {
    return this.page.getByTestId('reveal-mnemonic');
  }

  get continueButton() {
    return this.page.getByTestId('create-wallet-confirm');
  }

  /** The "Hold to continue" button inside the save-phrase confirmation modal. */
  get holdToContinue() {
    return this.page.getByTestId('save-phrase-hold');
  }

  async waitForPage() {
    await this.revealButton.waitFor({ state: 'visible' });
  }

  /** Open the save-phrase confirmation modal. */
  async openConfirm() {
    await this.continueButton.click();
    await this.holdToContinue.waitFor({ state: 'visible' });
  }

  /**
   * Press and hold the button for `ms`, then release. The gesture is wall-clock
   * timed in the component, so the press must really last that long.
   */
  private async pressHold(ms: number) {
    const box = await this.holdToContinue.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.waitForTimeout(ms);
      await this.page.mouse.up().catch(() => {});
    } else {
      await this.holdToContinue.dispatchEvent('mousedown');
      await this.page.waitForTimeout(ms);
      await this.holdToContinue.dispatchEvent('mouseup').catch(() => {});
    }
  }

  /** Open the modal and complete the hold-to-continue gesture to create the wallet. */
  async confirmAndCreate() {
    await this.openConfirm();
    await this.pressHold(2500);
  }

  /** A short tap on the hold button — not long enough to confirm. */
  async tapHold() {
    await this.holdToContinue.dispatchEvent('mousedown');
    await this.page.waitForTimeout(100);
    await this.holdToContinue.dispatchEvent('mouseup');
  }
}
