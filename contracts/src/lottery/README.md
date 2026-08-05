# Lottery Smart Contract (Tolk)

A simple lottery contract owned by the FossFi minter. Players enter by sending an
entry fee through the minter; after the reveal deadline, anyone may call `DrawWinner`,
and the prize is minted to the winner as FI jettons by the minter.

## Overview

The lottery is a single contract with a single-entry, single-draw lifecycle:

1. **Entry** — anyone can enter by sending `EnterLottery` from the minter (the
   contract's owner). Entries are recorded in a participants map.
2. **Deadline** — the reveal deadline is set on the first entry
   (`now + REVEAL_DEADLINE_SECONDS`). No further entries are accepted after it.
3. **Draw** — anyone can call `DrawWinner` after the deadline. A winner is selected
   deterministically from the participants, the TON pot is forwarded to the minter,
   and the minter mints the prize as FI jettons to the winner.

## Architecture

### Contracts Involved

- `Lottery` (`contracts/src/lottery/lottery.tolk`) — collects entries, holds the pot,
  selects the winner.
- `FossFi` minter (`contracts/src/fossFi/FossFi.tolk`) — owns the lottery (its
  address is the lottery's `owner`). On `LotteryWin` it mints FI to the winner.
- `FossFiWallet` — the winner's jetton wallet, deployed by the minter during the mint.

### Coupling with the Minter

The lottery and the minter are a coupled system:

- The lottery must be deployed at exactly the address computed by
  `calcDeployLottery(owner, entryAmount, lotteryCode)` in `FossFi.tolk` so the
  minter's `LotteryWin` sender check passes.
- The minter's `others.lotteryCode` cell must hold the compiled lottery code.
- On draw, the lottery forwards its entire TON pot to the minter
  (`SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS`); the
  minter uses that value to fund the winner's wallet deploy and mints `prizePool`
  FI jettons to the winner (`totalSupply += amt`).

### Winner Selection

`selectWinner` picks an index deterministically:

```
winnerIndex = randomSeed % participantCount
```

`randomSeed` is accumulated on each entry by XOR-ing the participant's address hash
into the seed (`randomSeed ^= sha256(sender)`), so the outcome depends on the set of
participants and the order-independent XOR of their addresses.

## Messages

### EnterLottery (0x11111111) — from minter to lottery

```tolk
struct (0x11111111) EnterLottery {
    sender: address   // the player
    amount: coins     // must equal the lottery's entryAmount
}
```

Sender must be the lottery's `owner` (the minter). `amount` must equal
`storage.entryAmount`, otherwise entry is rejected (`throw 202`). If it is the first
entry, the reveal deadline is set; afterwards entries past the deadline throw `201`.

### DrawWinner (0x44444444) — from anyone to lottery

```tolk
struct (0x44444444) DrawWinner {
    queryId: uint64
}
```

Requires `now > revealDeadline` (`throw 400`) and at least one participant
(`throw 401`). The lottery selects the winner and sends `LotteryWin` to its owner
(the minter), then resets its storage for the next lottery.

### LotteryWin (0x22222222) — from lottery to minter

```tolk
struct (0x22222222) LotteryWin {
    entryAmount: coins
    amt: coins        // prizePool to mint
    winner: address   // the winning player
}
```

Handled by the minter's `LotteryWin` arm: the sender must equal
`calcDeployLottery(minter, entryAmount, lotteryCode).calculateAddress()`. The minter
increments `totalSupply` by `amt` and sends a deploy message with an
`InternalTransferStep` to the winner's jetton wallet.

## Storage

```tolk
struct LotteryStorage {
    owner: address                 // the minter
    entryAmount: coins
    participants: map<address, ()> // players in the current round
    participantCount: int32 = 0
    revealDeadline: int32 = 0      // set on first entry
    prizePool: coins = 0           // accumulated entry value
    randomSeed: uint256 = 0        // XOR of participant address hashes
}
```

## Get Methods

```tolk
get fun getParticipantCount(): int32
get fun isParticipant(addr: address): bool
get fun getDeadline(): int32
get fun getCurrentPhase(): int8
get fun getPrizePool(): coins
```

Phases (`getCurrentPhase`): `PHASE_ENTRY` (no entries yet), `PHASE_REVEAL` (entries
open until deadline), `PHASE_COMPLETE` (deadline passed, draw available).

## Constants

```tolk
const REVEAL_DEADLINE_SECONDS: int = 3600 // 1 hour to reveal
```

The entry amount is defined by the minter side
(`LOTTERY_ENTRY_AMT` in `contracts/src/fossFi/consts.tolk`).

## Error Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 201  | Entry after the reveal deadline          |
| 202  | Entry amount does not match entryAmount  |
| 400  | Draw before the reveal deadline          |
| 401  | Draw with no participants                |
| 700  | EnterLottery sender is not the owner     |
| 999  | Winner selection fallback (should never hit) |

## Testing

`contracts/tests/lottery.test.tolk` covers:

- Deploy + accepting a correct entry
- Rejecting an entry with an incorrect amount
- Full payout: draw winner mints FI to the winner (asserts the winner's wallet
  balance and minter `totalSupply` both increase by the entry amount)

Note on time: tests must jump time with an absolute timestamp
(`testing.setNow(1_800_000_000 + REVEAL_DEADLINE_SECONDS + 1)`), not
`testing.getNow() + delta`. Before any `setNow`, `testing.getNow()` is `0`, so a
relative jump lands in the unix epoch and breaks the emulator's storage phase
(error `-669`).

## Status

- Entry, deadline enforcement, and payout are implemented and tested.
- The minter `LotteryWin` arm currently asserts the lottery address via
  `calcDeployLottery` and mints with a full `InternalTransferStep` deploy.
- Commit-reveal randomness is tracked separately; the current implementation uses
  address-hash XOR seeding.
