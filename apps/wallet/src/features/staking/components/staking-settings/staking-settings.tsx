/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';

import { useStakingProviders } from '../../hooks/use-staking-providers';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/core/components/ui/select';
import { SettingsButton } from '@/core/components/shared/settings-button';

interface StakingSettingsProps {
  providerId: string;
  setProviderId: (providerId: string) => void;
}

/** Gear button that opens a modal to choose the staking provider. */
export const StakingSettings: React.FC<StakingSettingsProps> = ({
  providerId,
  setProviderId,
}) => {
  const providers = useStakingProviders();

  const [open, setOpen] = useState(false);
  const [tempProviderId, setTempProviderId] = useState(providerId);

  const [prevOpenState, setPrevOpenState] = useState({ open, providerId });
  if (open !== prevOpenState.open || providerId !== prevOpenState.providerId) {
    setPrevOpenState({ open, providerId });
    if (open) {
      setTempProviderId(providerId);
    }
  }

  const handleSave = () => {
    if (tempProviderId !== providerId) {
      setProviderId(tempProviderId);
    }
    setOpen(false);
  };

  const selectedProviderName = providers.find(
    (provider) => provider.id === tempProviderId,
  )?.name;

  return (
    <>
      <SettingsButton
        onClick={() => setOpen(true)}
        aria-label="Staking settings"
      />

      <Modal.Container isOpened={open} onOpenChange={setOpen}>
        <Modal.Header onClose={() => setOpen(false)}>
          <Modal.Title>Staking settings</Modal.Title>
        </Modal.Header>
        <Modal.Body className="gap-6">
          <div className="flex flex-col gap-2">
            <span className="block text-sm font-medium text-foreground">
              Provider
            </span>
            <Select value={tempProviderId} onValueChange={setTempProviderId}>
              <SelectTrigger className="w-full rounded-2xl border border-border bg-secondary p-3.5 text-base font-medium capitalize text-foreground hover:bg-secondary/80 focus-visible:border-primary focus-visible:ring-0 data-[state=open]:border-primary">
                {selectedProviderName ? (
                  <span className="capitalize">{selectedProviderName}</span>
                ) : (
                  <span className="text-muted-foreground">Select provider</span>
                )}
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {providers.map((provider) => (
                  <SelectItem
                    key={provider.id}
                    value={provider.id}
                    className="text-sm capitalize"
                  >
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button fullWidth onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal.Container>
    </>
  );
};
