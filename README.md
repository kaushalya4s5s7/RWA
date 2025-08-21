# 🏠 RWA Tokenization Platform

**Real-World Asset Tokenization on OneChain Network**

A comprehensive platform for tokenizing real-world assets including Real Estate, Invoices, Commodities, Stocks, and Carbon Credits on the OneChain network, a high-performance blockchain based on the Sui architecture. The platform features an automated marketplace listing using **OCT tokens**.

---

## 📋 Table of Contents

1. [Platform Overview](#-platform-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Smart Contracts Architecture (Move-based)](#-smart-contracts-architecture-move-based)
5. [OneChain Integration & Benefits](#-onechain-integration--benefits)
6. [User Roles & Workflows](#-user-roles--workflows)
7. [Installation & Setup](#-installation--setup)
8. [Contract Deployment](#-contract-deployment)
9. [Environment Configuration](#-environment-configuration)
10. [API Documentation](#-api-documentation)
11. [Frontend Architecture](#-frontend-architecture)
12. [Backend Services](#-backend-services)
13. [IPFS Integration](#-ipfs-integration)
14. [Security Features](#-security-features)
15. [Testing](#-testing)
16. [Deployment](#-deployment)
17. [Contributing](#-contributing)
18. [License](#-license)

---

## 🌟 Platform Overview

The RWA Tokenization Platform enables users to convert real-world assets into secure, on-chain digital objects and trade them on a decentralized marketplace. Built on the **OneChain network**, the platform offers:

- **Asset Tokenization**: Convert physical assets into unique digital objects using the Move language's powerful resource model.
- **Automated Marketplace**: Seamless listing and trading of tokenized assets.
- **Rental Income Distribution**: Automatic **OCT** distribution to asset holders.
- **Multi-Asset Support**: Real Estate, Invoices, Commodities, Stocks, Carbon Credits.
- **Enterprise-Grade Security**: Leverage Move's built-in security features and role-based access control.

---

## ✨ Key Features

### 🏢 Asset Tokenization
- **Multiple Asset Types**: Support for 5 different asset categories.
- **IPFS Storage**: Decentralized storage for asset metadata and documents.
- **Automatic Listing**: Assets are automatically listed on the marketplace after creation.
- **Flexible Asset Types**: Support for both fungible (coins) and non-fungible (unique objects) assets.

### 🛒 Decentralized Marketplace
- **Unique Object IDs**: Utilizes OneChain's native hexadecimal object ID format.
- **No Asset Custody**: The marketplace facilitates trades without ever taking custody of user assets.
- **Native Transfers**: Uses OneChain's efficient, low-cost native object transfer operations.
- **OCT Payments**: Direct payments for purchases are made using the native **OCT** token.

### 💰 Revenue Distribution
- **Automated Splitting**: A dedicated Move module distributes rental income.
- **Proportional Rewards**: Income is distributed based on the number of fractional tokens owned.
- **Manager Controls**: Authorized managers can submit rental payments to the distribution module.
- **Real-time Tracking**: Complete on-chain payment history and analytics.

### 🔐 Role-Based Access
- **Admin Control**: Platform administration and user capability management.
- **Issuer Permissions**: Authorized roles for asset tokenization.
- **Manager Assignment**: Asset-specific management roles.
- **User Portfolio**: Individual asset ownership tracking through owned on-chain objects.

---

## 🛠 Technology Stack

### Blockchain & Smart Contracts
- **OneChain (Sui Fork)**: Primary blockchain network.
- **OneChain Native Object Model**: For creating secure, on-chain assets.
- **Move**: Smart contract language designed for safety and formal verification.
- **OneChain SDK / @mysten/sui.js**: For native blockchain interactions.

### Frontend
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **@mysten/sui.js**
- **React Router**

### Backend & Services
- **Node.js**
- **Express.js**
- **IPFS/Pinata**
- **OneChain Compatible Wallets**
- **OneChain RPC**

### Development Tools
- **Vite**
- **ESLint**
- **Sui CLI**
- **Git**

---

## 📜 Smart Contracts Architecture (Move-based)

### 1. Admin Module (`admin::access_control`)
**Purpose**: Central authority for managing roles and permissions via "AdminCap" (Admin Capability) objects.

**Key Functions**:
```move
public fun add_issuer(admin_cap: &AdminCap, issuer: address, metadata_uri: String, ctx: &mut TxContext);
public fun add_manager(admin_cap: &AdminCap, manager: address, metadata_uri: String, ctx: &mut TxContext);
public fun assign_manager(admin_cap: &AdminCap, manager: address, asset_id: ID, ctx: &mut TxContext);
public fun pause_marketplace(admin_cap: &AdminCap, marketplace: &mut Marketplace);
````

Features:
✅ Capability Management
✅ Manager Assignment
✅ Platform Controls
✅ Permission Validation

---

### 2. Marketplace Module (`marketplace::trading`)

**Purpose**: Facilitates asset listing and trading without taking custody of assets.

**Key Functions**:

```move
public entry fun list_asset(issuer_cap: &IssuerCap, asset: Asset, price: u64, ctx: &mut TxContext);
public entry fun buy_asset(listing: &mut Listing, payment: Coin<OCT>, ctx: &mut TxContext): Asset;
public entry fun delist_asset(listing: &mut Listing, ctx: &mut TxContext): Asset;
public fun all_listings(marketplace: &Marketplace): vector<ID>;
```

Features:
✅ No Asset Custody
✅ Native Object IDs
✅ OCT Accumulation
✅ Direct Object Transfers

---

### 3. PaymentSplitter Module (`distributor::revenue`)

**Purpose**: Automated rental income distribution to asset holders.

**Key Functions**:

```move
public entry fun submit_rental_payment(manager_cap: &ManagerCap, asset_id: ID, payment: Coin<OCT>, ctx: &mut TxContext);
public fun claim_revenue(share: &mut RevenueShare, ctx: &mut TxContext): Coin<OCT>;
public fun get_token_holders(asset_id: ID): vector<address>;
```

Features:
✅ Proportional Distribution
✅ Manager Controls
✅ Native Object Support
✅ Automatic Calculation
✅ On-Chain Audit Trail

---

### 4. OneChain Native Objects

* **High Security**: Move’s resource model ensures ownership and prevents duplication.
* **Low Fees**: Predictable and low-cost transactions.
* **Fast Finality**: Sub-second confirmations.
* **True Digital Ownership**: Assets are first-class citizens on the blockchain.
---
### Credora Workflow

![https://raw.githubusercontent.com/kaushalya4s5s7/Credora/refs/heads/main/public/workflow%20onechain.jpg](https://raw.githubusercontent.com/kaushalya4s5s7/Credora/refs/heads/main/public/workflow%20onechain.jpg)

---
### Smart contract Workflow

![https://raw.githubusercontent.com/kaushalya4s5s7/Credora/refs/heads/main/public/contract%20flow.png](https://raw.githubusercontent.com/kaushalya4s5s7/Credora/refs/heads/main/public/contract%20flow.png)

---
📝 Contract Deployment
Deploy Move Package


# Using the One CLI
cd move_contracts
one client publish --gas-budget 100000000


# OneChain Configuration
VITE_ONECHAIN_NETWORK=testnet
VITE_ONECHAIN_RPC_URL=[https://rpc-testnet.onelabs.cc:443](https://rpc-testnet.onelabs.cc:443)

# Deployed Package IDs
VITE_ADMIN_PACKAGE_ID=0xf80c253bc01793cb6d8815c38b9b6a665bacf9f2b2e32d29a39598a39fd51b29
VITE_MARKETPLACE_PACKAGE_ID=0x0c7a73e60f5ed8905b6e27eead169c75a9f410a4668e32e12c08d9dfbe9c7bfd
VITE_ISSUER_REGISTRY_PACKAGE_ID=0x2b8f314190ecb97381c1b8a5efa62f8e21e9becaf637d82f538f5c00ce5932a0

# Deployed Core Object IDs
VITE_MARKETPLACE_OBJECT_ID=0xb18514fa9c08de270a6df05ce2ecf06ba225218e4b10bebd595b8227bc46cdf9
VITE_ISSUER_REGISTRY_OBJECT_ID=0x5cb11f0d91fca68482f8fce83902d00f9b364fdd40080784ad171ec3137e17a7

# Coin Type
VITE_OCT_COIN_TYPE=0x2::oct::OCT

# IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt

# Backend API
VITE_BACKEND_API=http://localhost:5000


---

## 🚀 OneChain Integration & Benefits

* **Performance**: 100,000+ TPS, sub-second finality, low fees.
* **Security**: Move language ensures strong ownership and formal verification.
* **Native Object Model**: No smart contract bottlenecks, atomic composability.

---

## 👥 User Roles & Workflows

* **Admin**: Manage roles, assign managers, emergency controls.
* **Issuer**: Mint and list assets.
* **Manager**: Oversee assets, submit rental income.
* **User**: Browse marketplace, buy assets, claim income.

---

## 🔧 Installation & Setup

**Prerequisites**:

```bash
Node.js 18+, npm/yarn, Git, OneChain wallet
```

Clone repo:

```bash
git clone https://github.com/your-username/move-rwa.git
cd move-rwa
```

Frontend:

```bash
cd Frontend
npm install
npm run dev
```

Backend:

```bash
cd Backend
npm install
npm start
```

---

## 📝 Contract Deployment

Deploy Move contracts:

```bash
cd move_contracts
sui client publish --gas-budget 100000000
```

---

## ⚙️ Environment Configuration

Frontend `.env`:

```env
VITE_ONECHAIN_NETWORK=mainnet
VITE_ONECHAIN_RPC_URL=https://fullnode.mainnet.onechain.io
```

(Include package IDs, object IDs, IPFS keys, etc.)

---

## 🔌 API Documentation

* **Auth**: `/api/auth/login`, `/api/auth/register`
* **Assets**: `/api/assets/marketplace-listings`, `/api/assets/create`
* **Admin**: `/api/admin/add-issuer`, `/api/admin/add-manager`

---

## 🎨 Frontend Architecture

* Components: `ui/`, `marketplace/`
* Pages: `admin/`, `issuer/`, `marketplace/`
* Services: Blockchain, marketplace, auth

---

## 🔧 Backend Services

* Routes: `authRouter.js`, `assetRouter.js`, `adminRouter.js`
* Middleware: `auth.js`, `cors.js`
* Models: `User.js`, `Asset.js`

---

## 📁 IPFS Integration

* **Images**: Asset photos
* **Metadata**: JSON with asset details
* **Example**:

```json
{
  "name": "Luxury Downtown Apartment",
  "description": "Premium 2BR apartment in city center",
  "image": "ipfs://QmImageHash"
}
```

---

## 🛡️ Security Features

* Capability-based access
* Type safety
* Emergency pause
* JWT authentication
* Input sanitization

---

## 🧪 Testing

```bash
# Move tests
cd move_contracts
sui move test

# Frontend
cd Frontend
npm run test
```

---

## 🚀 Deployment

* **Frontend**: Vercel
* **Backend**: Railway/Heroku
* **Contracts**: OneChain testnet

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch
3. Submit PR

---

## 📄 License

MIT License

---

**Built with ❤️ on OneChain**
Tokenizing the world's assets, one object at a time.
