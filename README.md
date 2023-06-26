## Monstera

 <h1 align="center">Monstera</h1>

<p align="center">
Monstera is a web application for injesting and monitioring mainnet eth and erc 20 balances across multiple wallets. 
</p>

The architecture is rather straightforward:

- The user sets public keys of the wallets they wish to track.
- The site uses a single sql query to parse past mainnet transactions and find user token balances at points in time.
- These token balance histories are reflected in the UI.

To run locally:

```bash
pnpm i
pnpm gen
pnpm dev
```

Monstera uses (Tranpose)[http://tranpose.io] to query mainnet token history with a single SQL query.

You'll need to set the following environment variable to run locally:

```
VITE_TRANSPOSE_API_KEY
```

Future improvements:

- Use map rather than array in portfolio store.
- Add ENS integration.
- Improve addresses interface.
- Add multichain calls (would be quite easy with Transpose).
- Loading states and empty states.

Privacy:
All data in the app is ephemeral, with the only data being transfered is the public keys of the wallets you wish to track to Transpose. No other data is collected or stored. No private key signatures are required.

Additionally, when the app is not actively being used, balances and wallet addresses are hidden from the UI.
