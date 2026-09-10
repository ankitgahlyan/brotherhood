import { Address } from '@ton/core';
import { Lottery } from '@wrappers/Lottery.gen';
import { DEFAULT_NETWORK, type Network } from './config';
import { getTonClient } from './ton';

export interface LotteryStateData {
  participantCount: number | null;
  prizePool: bigint | null;
  currentPhase: number | null;
  deadline: number | null;
  isParticipant: boolean;
}

const lotteryCache = new Map<string, { data: any; timestamp: number }>();

export async function fetchLotteryState(
  lotteryAddressString: string,
  userAddressString?: string,
  network: Network = DEFAULT_NETWORK,
): Promise<LotteryStateData | null> {
  if (!lotteryAddressString) return null;
  const cacheKey = `lottery-state:${network}:${lotteryAddressString}:${userAddressString ?? 'none'}`;
  const cached = lotteryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30_000) {
    return cached.data;
  }

  const lotteryAddr = Address.parse(lotteryAddressString);
  const client = getTonClient(network);
  const lotteryContract = client.open(Lottery.fromAddress(lotteryAddr));

  const [participantCount, prizePool, currentPhase, deadline] = await Promise.all([
    lotteryContract.getParticipantCount().catch(() => 0n),
    lotteryContract.getPrizePool().catch(() => 0n),
    lotteryContract.getCurrentPhase().catch(() => 0n),
    lotteryContract.getDeadline().catch(() => 0n),
  ]);

  let isParticipant = false;
  if (userAddressString) {
    try {
      const uAddr = Address.parse(userAddressString);
      isParticipant = await lotteryContract.getIsParticipant(uAddr);
    } catch {
      isParticipant = false;
    }
  }

  const result: LotteryStateData = {
    participantCount: Number(participantCount),
    prizePool,
    currentPhase: Number(currentPhase),
    deadline: Number(deadline),
    isParticipant,
  };

  lotteryCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
