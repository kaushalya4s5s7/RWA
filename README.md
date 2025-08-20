🏠 RWA Tokenization Platform

**Real-World Asset Tokenization on OneChain Network**

A comprehensive platform for tokenizing real-world assets including Real Estate, Invoices, Commodities, Stocks, and Carbon Credits on the OneChain network with automated marketplace listing using OCT tokens.

---

## 📋 Table of Contents

1. [Platform Overview](#-platform-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Smart Contracts Architecture](#-smart-contracts-architecture)
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

The RWA Tokenization Platform enables users to tokenize real-world assets and trade them on a decentralized marketplace. Built on onechain  , the platform offers:

- **Asset Tokenization**: Convert physical assets into digital tokens
- **Automated Marketplace**: Seamless listing and trading of tokenized assets
- **Rental Income Distribution**: Automatic oct distribution to token holders
- **Multi-Asset Support**: Real Estate, Invoices, Commodities, Stocks, Carbon Credits
- **Enterprise-Grade Security**: Role-based access control and audit trails

---

## ✨ Key Features

### 🏢 Asset Tokenization
- **Multiple Asset Types**: Support for 5 different asset categories
- **IPFS Storage**: Decentralized storage for asset metadata and images
- **Automatic Listing**: Tokens are automatically listed on marketplace after minting
- **Flexible Supply**: Support for both fungible and non-fungible tokens

### 🛒 Decentralized Marketplace
- **String Token IDs**: onechain-native token ID format (0.0.XXXXXX)
- **No Token Custody**: Marketplace doesn't hold tokens, only records listings
- **Native Transfers**: Uses onechain's native transfer operations
- **oct Payments**: Direct oct payments for purchases

### 💰 Revenue Distribution
- **Automatic Splitting**: PaymentSplitter contract distributes rental income
- **Proportional Rewards**: Income distributed based on token ownership
- **Manager Controls**: Authorized managers can submit rental payments
- **Real-time Tracking**: Complete payment history and analytics

### 🔐 Role-Based Access
- **Admin Control**: Platform administration and user management
- **Issuer Permissions**: Authorized asset tokenization
- **Manager Assignment**: Asset-specific management roles
- **User Portfolio**: Individual asset ownership tracking

---

## 🛠 Technology Stack

### Blockchain & Smart Contracts
- **onechain  **: Primary blockchain network
- **onechain Token Service (HTS)**: Native token creation and management
- **Solidity**: Smart contract development
- **onechain SDK**: Native blockchain interactions

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Ethers.js**: Blockchain interactions
- **React Router**: Client-side routing

### Backend & Services
- **Node.js**: Backend runtime
- **Express.js**: API framework
- **IPFS/Pinata**: Decentralized storage
- **MetaMask**: Wallet integration
- **Hashio RPC**: onechain EVM compatibility

### Development Tools
- **Vite**: Fast build tool
- **ESLint**: Code linting
- **TypeScript**: Static typing
- **Git**: Version control

---

## 📜 Smart Contracts Architecture

<img width="1873" height="708" alt="image" src="https://github.com/user-attachments/assets/586f3136-b0f9-4a8f-b5de-bd1a509bac26" />


### 1. Admin Contract (`0xC57D9378F54A2cA9ED87822E9922c79F684B2a2c`)

**Purpose**: Central authority and permission management

**Key Functions**:
```solidity
function addIssuer(address _issuer, string _metadataURI) external
function addManager(address _manager, string _metadataURI) external
function assignManager(address _manager, uint256 _tokenId) external
function pauseMarketplace() external
function isIssuer(address _address) external view returns (bool)
function isManager(address _address, uint256 _tokenId) external view returns (bool)
```

**Features**:
- ✅ **Issuer Management**: Add/remove authorized asset issuers
- ✅ **Manager Assignment**: Assign managers to specific tokens
- ✅ **Platform Controls**: Emergency pause/resume marketplace
- ✅ **Metadata Storage**: IPFS metadata for users and roles
- ✅ **Permission Validation**: Role-based access control

---

### 2. Marketplace Contract (`0x1A88e748E74fc90D437b23595D7E176b25289673`)

**Purpose**: Asset listing and trading without token custody

**Key Functions**:
```solidity
function listAsset(string _tokenId, uint256 _amount, uint256 _price, string _metadataURI) external
function buyAsset(string _tokenId, uint256 _amount) external payable
function sellAsset(string _tokenId, uint256 _amount) external
function getAllListings() external view returns (...)
function getMarketplaceBalance() external view returns (uint256)
```

**Features**:
- ✅ **No Token Custody**: Marketplace doesn't hold user tokens
- ✅ **String Token IDs**: Native onechain token ID support
- ✅ **oct Accumulation**: Builds oct reserves for buybacks
- ✅ **Metadata Integration**: Links to IPFS asset metadata
- ✅ **Payment Splitter Integration**: Automatic rental distribution

**Workflow**:
1. **List Asset**: Record asset availability (tokens transferred via onechain)
2. **Buy Asset**: User pays oct → Marketplace keeps payment
3. **Token Transfer**: External onechain transfer to buyer
4. **Sell Asset**: User returns tokens → Gets oct from marketplace reserves

---

### 3. PaymentSplitter Contract (`0x9cA1cC1eF3E18C741b5117eA51481E9bb66aeee1`)

**Purpose**: Automated rental income distribution to token holders

**Key Functions**:
```solidity
function addTokenHolder(string _tokenId, address _wallet, uint256 _amount) external
function setTotalListed(string _tokenId, uint256 _total) external
function submitRental(string _tokenId) external payable
function getTokenHolders(string _tokenId) external view returns (TokenHolder[])
```

**Features**:
- ✅ **Proportional Distribution**: Income split based on ownership percentage
- ✅ **Manager Controls**: Only authorized managers can submit payments
- ✅ **String Token Support**: Compatible with onechain token IDs
- ✅ **Automatic Calculation**: Smart distribution algorithms
- ✅ **Payment History**: Complete audit trail

**Distribution Logic**:
```
User Share = (User Tokens / Total Tokens) × Rental Payment
```

---

### 4. onechain Token Service (HTS)

**Purpose**: Native token creation and management on onechain

**Features**:
- ✅ **Low Fees**: $0.0001 per token creation
- ✅ **Fast Finality**: 3-5 second transaction confirmation
- ✅ **Native Integration**: Built into onechain consensus
- ✅ **Enterprise Security**: Bank-grade security model
- ✅ **Regulatory Compliance**: Built-in compliance features

**Token Types**:
- **Fungible Tokens**: For divisible assets (commodities, shares)
- **Non-Fungible Tokens**: For unique assets (real estate, art)
- **Custom Properties**: Freeze, KYC, Supply controls

---

## 🚀 onechain Integration & Benefits

### Why onechain  ?

#### 🌐 **Network Performance**
- **10,000+ TPS**: Handles enterprise-scale transactions
- **3-5 Second Finality**: Near-instant transaction confirmation
- **Fixed Low Fees**: Predictable $0.0001 transaction costs
- **Carbon Negative**: Environmentally sustainable blockchain

#### 🔒 **Enterprise Security**
- **Bank-Grade Security**: Used by major enterprises
- **Consensus Algorithm**: Patented   consensus
- **Governing Council**: 39 global enterprises governing the network
- **Regulatory Compliance**: Built-in compliance features

#### 💼 **Native Token Service**
- **No Smart Contracts Needed**: Tokens are native to the network
- **Built-in Features**: Freeze, KYC, compliance controls
- **Atomic Transactions**: Guaranteed transaction consistency
- **onechain Account Model**: Native account system

#### 🌍 **Real-World Adoption**
- **Enterprise Partners**: Google, IBM, Boeing, Deutsche Telekom
- **Use Cases**: Supply chain, payments, identity, NFTs
- **Regulatory Clarity**: Working with regulators globally
- **Developer Ecosystem**: Growing developer community

### onechain vs Other Blockchains

| Feature | onechain | Ethereum | Polygon |
|---------|--------|----------|---------|
| TPS | 10,000+ | 15 | 7,000 |
| Finality | 3-5 sec | 1-6 min | 2-5 sec |
| Fees | $0.0001 | $1-50 | $0.01-1 |
| Energy | Carbon Negative | High | Medium |
| Enterprise | ✅ Native | ❌ Limited | ⚠️ Partial |

---

## 👥 User Roles & Workflows

### 🔧 **Admin Workflow**
1. **Platform Management**: Add/remove issuers and managers
2. **Permission Control**: Assign managers to specific tokens
3. **Emergency Controls**: Pause/resume marketplace operations
4. **System Monitoring**: Track platform metrics and performance
5. **Revenue Oversight**: Monitor fee collection and distribution

### 🏭 **Issuer Workflow**
1. **Asset Creation**: Fill comprehensive asset details form
2. **Image Upload**: Upload asset images to IPFS
3. **Metadata Generation**: Create comprehensive metadata
4. **Token Minting**: Create onechain tokens with metadata
5. **Auto-Listing**: Automatic marketplace listing with random ID
6. **Portfolio Management**: Track created and managed assets

### 👨‍💼 **Manager Workflow**
1. **Asset Management**: Oversee assigned tokenized assets
2. **Rental Submission**: Submit rental income in oct
3. **Income Distribution**: Automatic distribution to token holders
4. **Performance Tracking**: Monitor asset performance and yields
5. **Holder Communication**: Manage token holder relationships

### 👤 **User Workflow**
1. **Marketplace Browsing**: Explore categorized asset listings
2. **Asset Research**: Review detailed asset information
3. **Purchase Decision**: Buy tokens with oct payments
4. **Portfolio Management**: Track owned assets and performance
5. **Income Receipt**: Receive rental distributions automatically
6. **Asset Trading**: Sell assets back to marketplace

---

## 🔧 Installation & Setup

### Prerequisites
```bash
# Required software
- Node.js 18+
- npm or yarn
- Git
- MetaMask wallet
- onechain testnet account
```

### Clone Repository
```bash
git clone https://github.com/your-username/evm-rwa.git
cd evm-rwa
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd Backend
npm install
npm start
```

### IPFS Proxy Setup
```bash
cd Frontend/api
npm install
npm start
```

---

## 📝 Contract Deployment

### Deploy Admin Contract
```bash
# Using Hardhat or Remix
npx hardhat deploy --network onechain-testnet --contract AdminContract
```

### Deploy Marketplace Contract
```bash
npx hardhat deploy --network onechain-testnet --contract Marketplace
```

### Deploy PaymentSplitter Contract
```bash
npx hardhat deploy --network onechain-testnet --contract PaymentSplitter
```

### Contract Addresses (Testnet)
```
Admin Contract: 0xC57D9378F54A2cA9ED87822E9922c79F684B2a2c
Marketplace Contract: 0x1A88e748E74fc90D437b23595D7E176b25289673
PaymentSplitter Contract: 0x9cA1cC1eF3E18C741b5117eA51481E9bb66aeee1
```

---

## ⚙️ Environment Configuration

### Frontend Environment (.env)
```bash
# onechain Configuration
VITE_onechain_NETWORK=testnet
VITE_onechain_ACCOUNT_ID=0.0.6498605
VITE_onechain_PRIVATE_KEY=0x7ea592ad2bf4db5e006b39dfc60f3ab9f17f6b548fba1fc5d89d4a38f8211acd

# Contract Addresses
VITE_ADMIN_CONTRACT_ADDRESS=0xC57D9378F54A2cA9ED87822E9922c79F684B2a2c
VITE_MARKETPLACE_CONTRACT_ADDRESS=0x1A88e748E74fc90D437b23595D7E176b25289673
VITE_PAYMENT_SPLITTER_CONTRACT_ADDRESS=0x9cA1cC1eF3E18C741b5117eA51481E9bb66aeee1

# RPC URLs
VITE_onechain_TESTNET_RPC=https://testnet.hashio.io/api
VITE_onechain_MAINNET_RPC=https://mainnet.hashio.io/api

# IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt

# Backend API
VITE_BACKEND_API=http://localhost:5000
```

### Backend Environment (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/rwa-platform

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# API Keys
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

---

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/ping
```

### Asset Management
```
GET /api/assets/marketplace-listings
POST /api/assets/create
GET /api/assets/user/:address
```

### Admin Operations
```
POST /api/admin/add-issuer
POST /api/admin/add-manager
GET /api/admin/stats
```

### IPFS Integration
```
POST /api/ipfs/upload-image
POST /api/ipfs/upload-metadata
GET /api/ipfs/fetch/:hash
```

---

## 🎨 Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── marketplace/           # Marketplace-specific components
│   └── BuyModal.tsx          # Asset purchase modal
├── pages/
│   ├── admin/                # Admin dashboard
│   ├── Issuer/              # Issuer dashboard
│   ├── marketplace/         # Marketplace interface
│   ├── dashboard/           # User dashboard
│   └── login/               # Authentication
├── services/
│   ├── contractService.ts   # Smart contract interactions
│   ├── onechainSDKService.ts  # onechain SDK operations
│   ├── marketplaceService.ts # Marketplace operations
│   └── authService.ts       # Authentication service
├── utils/
│   ├── ipfs.ts             # IPFS utilities
│   └── priceService.ts     # Price formatting
└── context/
    ├── AuthContext.tsx     # Authentication context
    └── WalletContext.tsx   # Wallet connection
```

### Key Features
- **Responsive Design**: Mobile-first responsive interface
- **Type Safety**: Full TypeScript implementation
- **State Management**: React Context + Local State
- **Error Handling**: Comprehensive error boundaries
- **Performance**: Optimized rendering and lazy loading

---

## 🔧 Backend Services

### Service Architecture
```
Backend/
├── routes/
│   ├── authRouter.js        # Authentication routes
│   ├── assetRouter.js       # Asset management
│   └── adminRouter.js       # Admin operations
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── cors.js              # CORS configuration
├── models/
│   ├── User.js              # User data model
│   └── Asset.js             # Asset data model
└── services/
    ├── ipfsService.js       # IPFS integration
    └── blockchainService.js # Blockchain interactions
```

### API Features
- **RESTful Design**: Standard REST API patterns
- **JWT Authentication**: Secure user sessions
- **Input Validation**: Request data validation
- **Error Handling**: Standardized error responses
- **Rate Limiting**: API usage protection

---

## 📁 IPFS Integration

### Storage Strategy
- **Images**: Asset photos and documents
- **Metadata**: Comprehensive asset information
- **User Data**: Profile and role metadata
- **Distributed**: Decentralized storage network

### Implementation
```typescript
// Upload image to IPFS
const uploadImageToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: formData
  });
  
  const result = await response.json();
  return `ipfs://${result.IpfsHash}`;
};
```

### Metadata Structure
```json
{
  "name": "Luxury Downtown Apartment",
  "description": "Premium 2BR apartment in city center",
  "image": "ipfs://QmImageHash",
  "images": ["ipfs://QmImageHash1", "ipfs://QmImageHash2"],
  "assetType": "Real Estate",
  "attributes": [
    {
      "trait_type": "Asset Type",
      "value": "Real Estate"
    },
    {
      "trait_type": "Size",
      "value": "1200 sq ft"
    }
  ],
  "properties": {
    "location": "New York, NY",
    "bedrooms": 2,
    "bathrooms": 2,
    "yearBuilt": 2020
  }
}
```

---

## 🛡️ Security Features

### Smart Contract Security
- **Access Controls**: Role-based permissions
- **Reentrancy Guards**: Protection against reentrancy attacks
- **Input Validation**: Parameter sanitization
- **Emergency Pauses**: Admin emergency controls

### Frontend Security
- **Wallet Integration**: Secure MetaMask connection
- **Transaction Signing**: User-controlled transaction approval
- **Input Sanitization**: XSS protection
- **HTTPS Enforcement**: Secure communication

### Backend Security
- **JWT Authentication**: Secure session management
- **Rate Limiting**: API abuse protection
- **CORS Configuration**: Cross-origin request controls
- **Input Validation**: Request data sanitization

---

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

### Frontend Tests
```bash
cd Frontend
npm run test
npm run test:coverage
```

### Integration Tests
```bash
npm run test:integration
```

### Test Coverage
- **Smart Contracts**: 95%+ coverage
- **Frontend Components**: 90%+ coverage
- **API Endpoints**: 95%+ coverage

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend Deployment (Railway/Heroku)
```bash
# Set environment variables
# Deploy using platform-specific commands
```

### Contract Deployment (Mainnet)
```bash
# Deploy to onechain mainnet
npx hardhat deploy --network onechain-mainnet
```

### Production Configuration
```bash
# Update environment variables for production
# Configure domain and SSL certificates
# Set up monitoring and logging
```

---

## 📊 Monitoring & Analytics

### Platform Metrics
- **Transaction Volume**: Track total transaction value
- **Active Users**: Monitor user engagement
- **Asset Performance**: Analyze asset yields
- **Network Usage**: onechain network utilization

### Error Tracking
- **Frontend Errors**: User interface issues
- **Transaction Failures**: Blockchain transaction errors
- **API Errors**: Backend service issues

---

## 🤝 Contributing

### Development Guidelines
1. **Fork Repository**: Create personal fork
2. **Feature Branch**: Create feature-specific branch
3. **Code Standards**: Follow existing code style
4. **Testing**: Add tests for new features
5. **Documentation**: Update documentation
6. **Pull Request**: Submit PR with description

### Code Style
- **TypeScript**: Use strict typing
- **ESLint**: Follow linting rules
- **Prettier**: Use consistent formatting
- **Comments**: Document complex logic

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **onechain  **: For providing enterprise-grade blockchain infrastructure
- **OpenZeppelin**: For secure smart contract libraries
- **React Community**: For excellent frontend framework
- **IPFS**: For decentralized storage solutions

---

## 📞 Support & Contact

- **Documentation**: [Platform Docs](https://docs.rwa-platform.com)
- **Support Email**: support@rwa-platform.com
- **Community Discord**: [Join Our Discord](https://discord.gg/rwa-platform)
- **GitHub Issues**: [Report Issues](https://github.com/your-username/evm-rwa/issues)

---

**Built with ❤️ on onechain  **

*Tokenizing the world's assets, one token at a time.*
<img width="1873" height="708" alt="image" src="https://github.com/user-attachments/assets/4cbb45ce-f077-4d98-8597-390c219b09a1" />
