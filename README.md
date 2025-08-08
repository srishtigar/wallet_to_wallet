# Simple Hedera Wallet

A minimal, fully functional Hedera Hashgraph wallet for academic purposes. This project demonstrates basic Hedera operations with just a few files.

## Features

- Check HBAR balance for any Hedera account
- Transfer HBAR between accounts
- View network information
- Simple web interface

## Files Structure

```
simple_hedera_wallet/
├── README.md           # This file
├── package.json        # Node.js dependencies
├── index.js           # Express server with Hedera SDK
├── public/
│   └── index.html     # Single-page web interface
└── .env.example       # Environment variables template
```

## Setup

1. **Install Node.js** (version 16 or higher)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Hedera account details (optional for balance checking)
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open browser** and go to `http://localhost:3000`

## Usage

### Check Balance
- Enter any Hedera Account ID (e.g., `0.0.123456`)
- Click "Check Balance"

### Transfer HBAR
- Enter your Account ID and Private Key
- Enter recipient Account ID
- Enter amount in HBAR
- Click "Transfer"

## Environment Variables

Create a `.env` file with:

```
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.your_account_id
HEDERA_PRIVATE_KEY=your_private_key_here
```


