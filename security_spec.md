# Security Specification - Firestore ABAC & Zero-Trust Rules

## 1. Data Invariants
1. **Default Deny**: Any unmatched document path is strictly denied for read and write.
2. **Admin Supremacy**: Users who exist in `/admins/{uid}` or match bootstrapped admin email with `email_verified == true` hold administrative authorization.
3. **Public Readability for Published Data**: Tournaments, categories, courts, matches, and team registrations can be read publicly by visitors for scoreboards and schedules.
4. **Identity & Role Tampering Guard**: Users cannot self-assign or elevate their own role to 'ADMIN' in `/users/{userId}`, nor modify another user's profile.
5. **Score Verification Integrity**: Once a match status is 'COMPLETED', referee score mutations are locked; only verified admins can modify verified match scores via the official correction flow.
6. **Path Variable Hardening**: All document keys must satisfy `isValidId(id)` (alphanumeric, hyphens, underscores up to 128 chars) to prevent path traversal or resource exhaustion.
7. **String & Array Bounding**: Every string must have a bounded length (`.size() <= MAX`), and array mutations must be bounded.
8. **Check-In & Roster Integrity**: Only tournament admins or authorized table officials can alter `checkInStatus` for teams at the registration desk.

## 2. The Dirty Dozen Attack Payloads
1. **Admin Escalation in User Profile**: A non-admin user creates `/users/{uid}` with `role: "ADMIN"`, `isApproved: true`. Expected: `PERMISSION_DENIED`.
2. **Impersonate Document ID**: User `uid_alice` attempts to write to `/users/uid_bob`. Expected: `PERMISSION_DENIED`.
3. **Ghost Field Injection (Shadow Update)**: Attacker attempts to update a team document with `isBypassed: true`. Expected: `PERMISSION_DENIED`.
4. **Oversized String Bomb (Denial of Wallet)**: Attacker tries to create a team name with a 50KB character string. Expected: `PERMISSION_DENIED`.
5. **Path ID Injection**: Attacker tries to create document with id `../../../etc/passwd` or non-alphanumeric junk. Expected: `PERMISSION_DENIED`.
6. **Terminal Match Override by Unauthorized User**: An unauthenticated user or unauthorized coach attempts to flip a completed match winner. Expected: `PERMISSION_DENIED`.
7. **Spoofed Unverified Admin Email**: Request has `auth.token.email: "istihadj@gmail.com"` but `email_verified: false`. Expected: `PERMISSION_DENIED`.
8. **Direct Admin Entry Creation**: An unauthenticated or normal user attempts to write to `/admins/{uid}`. Expected: `PERMISSION_DENIED`.
9. **Tampering with Audit Trail**: A user tries to delete an entry in `/auditLogs/{id}` or alter `timestamp`. Expected: `PERMISSION_DENIED`.
10. **Malicious Negative Score**: Attacker submits a set score with negative integers e.g. `-10`. Expected: `PERMISSION_DENIED`.
11. **Roster Overfill Attack**: Attacker injects 1,000 players into a single regu team array. Expected: `PERMISSION_DENIED`.
12. **Blanket Query Scraping**: Malicious client attempts an unbound collection scan for private PII fields without proper query criteria. Expected: `PERMISSION_DENIED`.

## 3. Test Runner
Refer to `firestore.rules.test.ts` for automated evaluation against local emulator or rules unit testing suite.
