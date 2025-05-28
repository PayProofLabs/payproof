# Security Policy

## Supported versions

PayProof is currently in early development (0.x). Only the latest commit on `main` receives fixes. There are no stable release branches yet.

## Architecture notes relevant to security

All transaction lookups happen in the browser against the public Stellar Horizon API. PayProof does not have a backend, does not store any data, and does not set cookies or run analytics. The only outbound requests are to `horizon.stellar.org` and `horizon-testnet.stellar.org`.

Transaction hashes are public information on the Stellar network. Receipt URLs contain the transaction hash, so treat them accordingly if the hash itself is sensitive to you.

## Reporting a vulnerability

Please do not open a public GitHub issue for security problems.

Email [security@payproof.org](mailto:security@payproof.org) with:

- A description of the issue
- Steps to reproduce
- What an attacker could do with it

I'll acknowledge within a few days and aim to ship a fix before public disclosure. Given the project's current scope (a client-only web app with no auth or stored data), the attack surface is limited, but reports are still welcome.
