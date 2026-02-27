# OpNet-Trivia — Leaderboard Smart Contract

A smart contract that permanently stores player scores on Bitcoin via OP_NET.

---

## 🚀 How to Deploy via OP_WALLET Extension

### Step 1 — Install & Build

```bash
cd OpNet-Trivia
npm install
npm run build
```

Output: **`build/contract.wasm`** — this is the file you will deploy.

---

### Step 2 — Open OP_WALLET Extension

1. Click the **OP_WALLET** icon in your browser
2. Switch the network to **Testnet**
3. Make sure you have a tBTC balance to pay for gas

> No tBTC? Claim for free at: **https://faucet.opnet.org**

---

### Step 3 — Deploy the Contract

1. In OP_WALLET, find the **"Deploy"** or **"Deploy Contract"** button
2. Click it
3. **Drag & drop** the `build/contract.wasm` file into the dialog
4. Click **Confirm / Send**
5. Wait ~30–60 seconds for Bitcoin confirmation

---

### Step 4 — Copy the Contract Address

Once the transaction is confirmed, OP_WALLET will display:

```
✅ Contract Deployed!
Address: bc1p....youraddress....
```

**Copy that address.**

---

### Step 5 — Add the Address to the Game

Open `opnet_game.html` and find this line at the top of the script:

```javascript
const CONTRACT_ADDRESS = 'PASTE_CONTRACT_ADDRESS_HERE'
```

Replace it with your address:

```javascript
const CONTRACT_ADDRESS = 'bc1p....youraddress....'
```

Save the file, upload to Vercel or GitHub Pages, and your game now has an **on-chain leaderboard on Bitcoin**! 🎉

---

## 📁 Project Structure

```
OpNet-Trivia/
├── src/
│   ├── contracts/
│   │   └── LeaderboardContract.ts   ← Main smart contract
│   ├── events/
│   │   └── ScoreSubmittedEvent.ts   ← On-chain event definition
│   └── index.ts                     ← Entry point
├── build/                           ← Compiled output (contract.wasm)
├── gulpfile.js                      ← Build config
├── package.json
└── README.md
```

---

## 📋 Contract Methods

| Method | Type | Description |
|--------|------|-------------|
| `submitScore(uint256)` | Write | Save score (only updates if higher than previous best) |
| `getScore(address)` | Read | Get the best score for a given wallet address |
| `getTopScore()` | Read | Get the highest score across all players |
| `getTotalPlayers()` | Read | Get the total number of unique players |

---

## 🔧 Troubleshooting

| Error | Fix |
|-------|-----|
| `No gulpfile found` | Make sure you ran `npm install` first |
| `asc not found` | Run `npm install assemblyscript --save-dev` |
| `Insufficient balance` | Claim tBTC at faucet.opnet.org |
| `build/contract.wasm not found` | Run `npm run build` first |

---

## 🌐 Links

- OP_WALLET: https://opnet.org/wallet
- Testnet Faucet: https://faucet.opnet.org
- Block Explorer: https://scan.opnet.org
- OP_NET Docs: https://dev.opnet.org
