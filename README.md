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

Monstera uses [https://app.transpose.io](Transpose) to query the blockchain. Transpose is a graphql api that allows for easy querying of the blockchain.

You'll need to set the following environment variable to run locally:

```
VITE_TRANSPOSE_API_KEY
```

Future improvements:

- Use map rather than array in portfolio store.
- Improve addresses interface.
- Add multichain calls (would be quite easy with Transpose).
- Loading states and empty states.
