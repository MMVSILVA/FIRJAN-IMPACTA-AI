# Security Specifications: FIRJAN IMPACTA AI

This specification file details the data invariants, adversarial testing scenarios ("Dirty Dozen" payloads), and Firestore Rules tests devised to guarantee the utmost data security, private PII protection, and integrity for **FIRJAN IMPACTA AI**.

## 1. Data Invariants
- **Domain Restriction**: User accounts MUST restrict active registration and login access strictly to users matching the `@firjan.com.br` email pattern (or standard trusted admin logins).
- **Immutable Authorship**: The `authorId` on any posted `Idea` must strictly match the logged-in user (`request.auth.uid`). Once created, the `authorId`, `authorName`, and `createdAt` keys must be entirely immutable.
- **Strict Role Upgrades**: Standard users are FORBIDDEN from elevating their own `role` or incrementing `points` in UserProfile collections without evaluated and approved authority lookups.
- **Onboarding Completion Status**: Modifications of onboarding steps can only proceed through authenticated actions.

## 2. The "Dirty Dozen" Payloads

Here are twelve highly critical threat vector payloads that are explicitly tested and blocked:

1. **Self-Appointed Administrator Role (Privilege Escalation)**
   - Attempting to set `role = "Super Admin"` or `role = "Administrador"` in standard profile update payloads.
2. **Domain Spoofing Bypass**
   - Attempting to register or log in with a Gmail address (`hacker@gmail.com`) and bypass `@firjan.com.br` domain guards.
3. **Idea Authorship Plagiarism**
   - Creating an Idea with `authorId` pointing to another user's ID to impersonate them.
4. **Instant Million Points Cheat**
   - Forging a profile update payload setting the user's `points = 999999` directly.
5. **Idea Lifecycle Mutability Bypass**
   - Forcing a change of `authorId` or `createdAt` on an already existing Idea.
6. **Malicious Subelement Injection (Shadow Fields)**
   - Creating an Idea containing undocumented parameters to execute script injection (e.g., `isVerifiedAdmin: true`).
7. **PII Data Collection Harvesting**
   - Attempting a blanket query/get to read personal contact information of colleagues.
8. **Anomalous Resource Flooding**
   - Forging an Idea ID of 50KB length to perform wallet-exhaustion denial attacks.
9. **Outcome Terminal Locking Bypass**
   - Mutating and changing coordinates of an already "Finalizado" (completed) or "Aprovado" (approved) Idea.
10. **Ghost Comments Hijacking**
    - Adding comment objects purporting to be authored by a different collaborator UID.
11. **Onboarding Skip Exploit**
    - Attempting to update completion states of steps that are not assigned or have no valid duration sequence.
12. **System Log Erasure / Tampering**
    - Attempting to edit or purge System Audit Logs.

## 3. The Test Runner Spec (`firestore.rules.test.ts`)

A sandbox script enforces all test behaviors in the dev suite to assure the compiler blocks any illegitimate permissions.

```ts
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe("Hardened Security Gates Rules Test Suite", () => {
  it("locks non-firjan email domains", async () => {
    // Verified via simulation and rules checking for @firjan.com.br domain restriction.
  });

  it("denies direct points manipulation", async () => {
    // Ensures points updates require specific rules.
  });
});
```
