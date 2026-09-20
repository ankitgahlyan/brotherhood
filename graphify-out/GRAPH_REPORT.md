# Graph Report - contracts (2026-09-20)

## Corpus Check

- Corpus is ~830 words - fits in a single context window. You may not need a graph.

## Summary

- 289 nodes · 236 edges · 64 communities (15 shown, 49 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- Contract Group 0
- Contract Group 1
- Contract Group 2
- Contract Group 3
- Contract Group 4
- Contract Group 5
- Contract Group 6
- Contract Group 7
- Contract Group 8
- Contract Group 9
- Contract Group 10
- Contract Group 11
- Contract Group 12
- Contract Group 13
- Contract Group 14
- Contract Group 15
- Contract Group 16
- Contract Group 17
- Contract Group 18
- Contract Group 19
- Contract Group 20
- Contract Group 21
- Contract Group 22
- Contract Group 23
- Contract Group 24
- Contract Group 25
- Contract Group 26
- Contract Group 27
- Contract Group 28
- Contract Group 29
- Contract Group 30
- Contract Group 31
- Contract Group 32
- Contract Group 33
- Contract Group 34
- Contract Group 35
- Contract Group 36
- Contract Group 37
- Contract Group 38
- Contract Group 39
- Contract Group 40
- Contract Group 41
- Contract Group 42
- Contract Group 43
- Contract Group 44
- Contract Group 45
- Contract Group 46
- Contract Group 47
- Contract Group 48
- Contract Group 49
- Contract Group 50
- Contract Group 51
- Contract Group 52
- Contract Group 53
- Contract Group 54
- Contract Group 55
- Contract Group 56
- Contract Group 57
- Contract Group 58
- Contract Group 59
- Contract Group 60
- Contract Group 61
- Contract Group 62
- Contract Group 63

## God Nodes (most connected - your core abstractions)

1. `common (module)` - 18 edges
2. `FossFi` - 15 edges
3. `FossFiWallet` - 15 edges
4. `jetton-utils (module)` - 14 edges
5. `fees-management (module)` - 13 edges
6. `storage (module)` - 11 edges
7. `fees-management (module)` - 11 edges
8. `Location` - 10 edges
9. `Lottery` - 10 edges
10. `PersonalMinter` - 10 edges

## Surprising Connections (you probably didn't know these)

- None detected - all connections are within the same source files.

## Import Cycles

- None detected.

## Communities (64 total, 49 thin omitted)

### Community 1 - "Contract Group 1"

Cohesion: 0.12
Nodes (4): AllowedMessageToWallet, BounceOpToHandle, FossFiWallet, FossFiWallet (module)

### Community 2 - "Contract Group 2"

Cohesion: 0.12
Nodes (4): AllowedMessageToMinter, BounceOpToHandle, FossFi, FossFi (module)

### Community 5 - "Contract Group 5"

Cohesion: 0.17
Nodes (12): Addresses, FiCodes, FiStore, FiWalletStore, Maps, NomInAddrs, ProfileInfo, ReportInfo (+4 more)

### Community 7 - "Contract Group 7"

Cohesion: 0.18
Nodes (4): AllowedBounced, AllowedMsgToPersonalMinter, PersonalMinter, personal (module)

### Community 8 - "Contract Group 8"

Cohesion: 0.20
Nodes (3): AllowedMessageToLocation, Location, Location (module)

### Community 9 - "Contract Group 9"

Cohesion: 0.20
Nodes (3): AllowedMessageToLottery, Lottery, lottery (module)

### Community 10 - "Contract Group 10"

Cohesion: 0.25
Nodes (3): AllowedMessageToDaoProxy, DaoProxy, DaoProxy (module)

### Community 11 - "Contract Group 11"

Cohesion: 0.25
Nodes (4): AllowedMessageToPoll, Poll, PollDataReply, Poll (module)

### Community 12 - "Contract Group 12"

Cohesion: 0.29
Nodes (3): Following, FollowingAllowedMsg, followers (module)

### Community 13 - "Contract Group 13"

Cohesion: 0.29
Nodes (4): AllowedMsgToPersonalWallet, BounceOpToHandle, PersonalWallet, personalWallet (module)

### Community 14 - "Contract Group 14"

Cohesion: 0.29
Nodes (7): AdminHandoff, CurrentRequest, ForwardPayloadRemainder, IdInfo, JettonDataReply, JettonWalletDataReply, messages (module)

### Community 15 - "Contract Group 15"

Cohesion: 0.40
Nodes (3): Holding, HoldingAllowedMsg, holding (module)

### Community 16 - "Contract Group 16"

Cohesion: 0.50
Nodes (3): AllowedMessageToVoter, Voter, Voter (module)

### Community 17 - "Contract Group 17"

Cohesion: 0.40
Nodes (5): DaoProxyStore, PollAddresses, PollStore, VoterStore, storage (module)

### Community 26 - "Contract Group 26"

Cohesion: 0.67
Nodes (3): PersonalStore, PersonalWalletStore, storage (module)

## Knowledge Gaps

- **71 isolated node(s):** `approve-upgrade (module)`, `change-admin (module)`, `change-metadata (module)`, `claim-admin (module)`, `deploy-fi (module)` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 240 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **What connects `approve-upgrade (module)`, `change-admin (module)`, `change-metadata (module)` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Contract Group 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Contract Group 1` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Contract Group 2` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Contract Group 3` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Contract Group 4` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
