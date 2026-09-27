# Research: Telegram Passport & Privacy-Preserving Country-Scoped Identity NFTs for BrotherHood

**Date**: 2026-09-27  
**Status**: Completed  
**Sources**:
- Telegram Core Passport Manual: <https://core.telegram.org/passport>
- Telegram Passport End-to-End Encryption Specification: <https://core.telegram.org/passport/encryption>
- Telegram MTProto Schema (`account.password`, `secureValue`): <https://core.telegram.org/schema>
- TON Enhancement Proposal 62 (NFT Standard): <https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md>
- TON Enhancement Proposal 85 (Soulbound NFT Standard): <https://github.com/ton-blockchain/TEPs/blob/master/text/0085-soulbound-nft-standard.md>
- W3C Verifiable Credentials Data Model v2.0: <https://www.w3.org/TR/vc-data-model-2.0/>

---

## 1. What is Telegram Passport and How It Works

### 1.1 Core Concept & Threat Model
Telegram Passport is a unified, client-side, end-to-end encrypted (E2EE) authorization framework for services requiring real-world identity verification (KYC/AML, fintech, crypto onboarding).

Its architectural principle is **zero-knowledge storage**:
- The storage provider (Telegram Cloud servers) stores only encrypted binary blobs.
- Telegram servers have **no cryptographic access** to user data, document photos, or personal metadata.
- Plaintext personal data only exists on the user's local client device and on the verifier's server after explicit, consent-based re-encryption.

### 1.2 Cryptographic Key Hierarchy & Encryption Mechanism

The Telegram Passport encryption scheme operates via multi-layered envelope encryption:

1. **Master Secret Derivation**:
   - The user configures a cloud 2FA password.
   - Using the MTProto constructor `securePasswordKdfAlgoPBKDF2HMACSHA512iter100000`, the client executes PBKDF2 with HMAC-SHA-512 over 100,000 iterations using a server-provided salt and client entropy to derive a master key.
2. **Passport Secret (`passport_secret`)**:
   - The client generates a 32-byte secret where $\sum \text{bytes} \pmod{255} = 239$.
   - This `passport_secret` is encrypted with the PBKDF2-derived master key and stored in Telegram Cloud alongside a 64-bit fingerprint:  
     $$\text{passport\_secret\_fingerprint} = \text{slice}(\text{SHA256}(\text{passport\_secret}), 0, 8)$$
3. **Per-Element Encryption (`SecureValue`)**:
   - For every identity element (passport photo, national ID, address bill, selfie), the client generates a distinct random 32-byte symmetric key `secret`.
   - The document files or personal details are encrypted using AES-256-CBC / AES-256-CTR with keys and IVs derived from:
     $$\text{key} = \text{SHA512}(\text{secret} \parallel \text{file\_hash})[0..31], \quad \text{iv} = \text{SHA512}(\text{secret} \parallel \text{file\_hash})[32..47]$$
   - The element `secret` itself is encrypted under `passport_secret`.
4. **Verifier Handshake & Asymmetric Re-encryption**:
   - Verifying bot/service creates a 2048-bit RSA keypair and registers the public key via BotFather.
   - Verifier issues a verification request with a cryptographic `nonce` and required scopes (`PassportScope`).
   - User client fetches the ciphertext blobs, decrypts them locally using the user's password, and re-encrypts the element secrets using the verifier's **RSA public key** (RSA-OAEP / PKCS#1 v1.5).
   - Verifier receives the encrypted bundle, decrypts it with its private key, checks the SHA-256 hashes of unencrypted payloads against certified document signatures, and stores verified records according to its compliance obligations.

---

## 2. Adapting the Concept to BrotherHood: Country-Scoped Identity NFTs

In BrotherHood, governance voting (`ActVote`), authority elevation, and spatial indexing (`Location` / H3 cells) are strictly partitioned by country (`ProfileInfo.country: uint16` matching ISO 3166-1, with `0` representing stateless/globalist members).

### 2.1 Why Soulbound NFTs (TEP-85)?
Identity must be non-transferable and sybil-resistant:
- Standard TEP-62 NFTs allow arbitrary transfers, which would let members sell or lease verified citizenship and authority status.
- **TEP-85 Soulbound NFTs (SBT)** reject standard transfer messages or omit transfer logic entirely.
- Each Passport NFT is bound permanently to the Member's Account (`FossFiWallet`).

### 2.2 Issuance & Authority Hierarchy Models

| Model | Architecture | Trust Assumptions | On-Chain Cost |
|---|---|---|---|
| **A. Authority Multi-Sig / Web of Trust** | $M$-of-$N$ elected national Authorities (`isAuthorityAccount == true` where `authority.country == profile.country`) co-sign an issuance message. | Completely decentralized; leverages existing BrotherHood governance. | Higher gas (collecting or aggregating $M$ signatures or multisig messages). |
| **B. Certified Identity Oracle / Attestor** | A dedicated verifier oracle (e.g. bridging Telegram Passport or accredited eID/passport NFC scanner) signs an attestation root that the Minter verifies. | Dependent on trusted attestor / oracle key, but verifiable offchain. | Minimal on-chain gas (single Ed25519 signature check on TON). |
| **C. Self-Attested with Authority Endorsement / Revocation** | Member deploys an unverified draft credential; local Authorities can stamp approval or dispatch `Revoke` upon sybil detection. | Optimistic; relies on report/slashing mechanics. | Very low initial friction; relies on social consensus. |

---

## 3. Privacy-Preserving Off-Chain Photo Verification

### 3.1 The On-Chain Biometric Privacy Problem
Storing unencrypted facial images, raw biometrics, or plain document scans on a public blockchain is catastrophic:
- **GDPR / BIPA Violations**: Permanent, immutable biometric storage violates the Right to Erasure (GDPR Art. 17).
- **Surveillance & Doxxing**: Public ledgers allow trivial reverse image searching and physical tracking of members.
- **TVM Storage Economics**: TON storage rent is billed per bit/cell. Storing high-resolution photos on-chain incurs continuous, unsustainable storage fees.

### 3.2 Cryptographic Commitment Scheme

Instead of the image, the Soulbound NFT stores a 256-bit cryptographic commitment:

$$C = H(\text{PhotoBytes} \parallel \text{Salt} \parallel \text{MemberAddress})$$

Where:
- $\text{PhotoBytes}$: Normalized raw bytes (or canonical EXIF-stripped JPEG/WebP) of the member's photo or document.
- $\text{Salt}$: A high-entropy 256-bit secret generated on the member's device (preventing rainbow table attacks against common face templates or image structures).
- $\text{MemberAddress}$: The member's `FossFiWallet` address, binding the commitment directly to the on-chain account to prevent replay attacks across accounts.
- $H$: A secure collision-resistant hash function (e.g., Blake2b-256 or SHA-256 for standard offchain verification; Poseidon if intended for ZK circuits).

### 3.3 Verification Workflows

#### Pattern 1: Selective Disclosure (Zero-Knowledge / Off-Chain Match)
1. **Local Vault Storage**:
   The member's device encrypts `PhotoBytes` and `Salt` using a key derived from their wallet's Ed25519 seed or passcode (mirroring Telegram Passport's E2EE vault) and keeps it in local storage or encrypted TON Storage.
2. **Off-Chain Presentation**:
   When interacting with a verifier (e.g., event doorman, P2P trade counterparty, or embassy):
   - Member presents their TON address / SBT token ID.
   - Member transmits `(PhotoBytes, Salt)` directly to the verifier over a local encrypted session (Bluetooth Low Energy, peer QR code, or E2EE message).
   - Verifier computes $H(\text{PhotoBytes} \parallel \text{Salt} \parallel \text{MemberAddress})$.
   - Verifier reads commitment $C$ from the on-chain SBT contract via Toncenter / liteserver.
   - If hashes match, verifier validates the photo matches the live human.

#### Pattern 2: ZK Biometric / Age Proof (Zero Raw Disclosure)
If the verifier must not even see the photo, but only verify:
- "The presenter's face matches the face certified in the SBT with $\ge 95\%$ embedding similarity", or
- "The presenter is over 18 years old and holds country ISO $X$":
The member's device generates a ZK-SNARK (using Circom / Groth16 or Noir) proving knowledge of `(PhotoBytes, Salt)` satisfying $C$ and satisfying the constraint without revealing the underlying image bytes.

---

## 4. Integration with Existing BrotherHood Contracts

1. **Country Scope**:
   The Passport NFT contract reads and verifies `ProfileInfo.country` from the member's `FossFiWallet`. If the member later calls `ChangeCountry`, the passport must either be revoked or migrated through standard governance rules.
2. **Account Closure & Nominee Settlement**:
   In BrotherHood, when an Account closes on death (`onDeath` / `settleNominee`), the Soulbound Passport NFT must be automatically burnt or marked expired (TEP-85 `destroy`), preventing dead identity zombies.
3. **Sybil Resistance**:
   Enforcing a 1:1 invariant: Each `FossFiWallet` can only hold $\le 1$ active `FiPassport` NFT.
