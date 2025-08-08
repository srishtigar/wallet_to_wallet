const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const {
    Client,
    AccountBalanceQuery,
    TransferTransaction,
    Hbar,
    PrivateKey,
    AccountId
} = require('@hashgraph/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Hedera client
function getHederaClient() {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    
    if (network === 'mainnet') {
        return Client.forMainnet();
    } else {
        return Client.forTestnet();
    }
}

// Routes

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get network information
app.get('/api/network', (req, res) => {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    res.json({
        network: network,
        status: 'connected',
        timestamp: new Date().toISOString()
    });
});

// Check account balance
app.get('/api/balance/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        
        // Validate account ID format
        if (!accountId.match(/^\d+\.\d+\.\d+$/)) {
            return res.status(400).json({
                error: 'Invalid account ID format. Use format: 0.0.123456'
            });
        }

        const client = getHederaClient();
        
        // Query the account balance
        const balance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);

        res.json({
            accountId: accountId,
            hbarBalance: balance.hbars.toString(),
            tokens: balance.tokens ? Object.fromEntries(balance.tokens) : {}
        });

    } catch (error) {
        console.error('Balance query error:', error);
        res.status(500).json({
            error: 'Failed to query balance',
            message: error.message
        });
    }
});

// Transfer HBAR
app.post('/api/transfer', async (req, res) => {
    try {
        const { fromAccountId, privateKey, toAccountId, amount } = req.body;

        // Validate required fields
        if (!fromAccountId || !privateKey || !toAccountId || !amount) {
            return res.status(400).json({
                error: 'Missing required fields: fromAccountId, privateKey, toAccountId, amount'
            });
        }

        // Validate account ID formats
        if (!fromAccountId.match(/^\d+\.\d+\.\d+$/) || !toAccountId.match(/^\d+\.\d+\.\d+$/)) {
            return res.status(400).json({
                error: 'Invalid account ID format. Use format: 0.0.123456'
            });
        }

        // Validate amount
        const hbarAmount = parseFloat(amount);
        if (isNaN(hbarAmount) || hbarAmount <= 0) {
            return res.status(400).json({
                error: 'Invalid amount. Must be a positive number'
            });
        }

        const client = getHederaClient();
        
        // Set operator (the account paying for the transaction)
        client.setOperator(fromAccountId, privateKey);

        // Create transfer transaction
        const transferTx = new TransferTransaction()
            .addHbarTransfer(fromAccountId, Hbar.fromTinybars(-hbarAmount * 100000000)) // Convert HBAR to tinybars
            .addHbarTransfer(toAccountId, Hbar.fromTinybars(hbarAmount * 100000000));

        // Execute the transaction
        const txResponse = await transferTx.execute(client);
        
        // Get the receipt
        const receipt = await txResponse.getReceipt(client);

        res.json({
            success: true,
            transactionId: txResponse.transactionId.toString(),
            status: receipt.status.toString(),
            fromAccount: fromAccountId,
            toAccount: toAccountId,
            amount: `${hbarAmount} HBAR`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({
            error: 'Transfer failed',
            message: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Simple Hedera Wallet',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Simple Hedera Wallet running on http://localhost:${PORT}`);
    console.log(`📊 Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
    console.log(`📝 Open your browser and navigate to the URL above`);
});

module.exports = app;

