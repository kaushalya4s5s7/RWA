import { MarketData } from './types';

export const marketData: MarketData = {
  realEstate: [
    {
      id: '1',
      title: 'Downtown Luxury Complex',
      price: 500000,
      description: 'Premium residential complex with 24/7 amenities and high rental demand.',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Real Estate',
      network: {
        name: 'Ethereum',
        logo: 'https://cdn-icons-png.flaticon.com/128/9202/9202660.png'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 38280,
      yield: 8.5,
    },
    {
      id: '2',
      title: 'Commercial Office Tower',
      price: 750000,
      description: 'Grade A office space in prime business district with long-term tenants.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Real Estate',
      network: {
        name: 'Ethereum',
        logo: 'https://cdn-icons-png.flaticon.com/128/9202/9202660.png'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 42500,
      yield: 7.8,
    },
    {
      id: '3',
      title: 'Boutique Hotel',
      price: 420000,
      description: 'Fully operational boutique hotel in tourist hotspot with proven track record.',
      imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Real Estate',
      network: {
        name: 'Ethereum',
        logo: 'https://cdn-icons-png.flaticon.com/128/9202/9202660.png'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Standard',
      earnXP: 25000,
      yield: 9.2,
    }
  ],
  invoices: [
    {
      id: '4',
      title: 'Tech Corp Receivables',
      price: 100000,
      description: 'Verified invoices from Fortune 500 tech company with 30-day payment terms.',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Invoices',
      network: {
        name: 'Polygon',
        logo: '/images/polygon-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 45000,
      yield: 12,
    },
    {
      id: '5',
      title: 'Healthcare Bundle',
      price: 250000,
      description: 'Diversified healthcare sector receivables from top-tier hospitals.',
      imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Invoices',
      network: {
        name: 'Polygon',
        logo: '/images/polygon-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Standard',
      earnXP: 35000,
      yield: 11.5,
    },
    {
      id: '6',
      title: 'Retail Chain AR',
      price: 150000,
      description: 'Account receivables from national retail chain with AAA credit rating.',
      imageUrl: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Invoices',
      network: {
        name: 'Polygon',
        logo: '/images/polygon-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Standard',
      earnXP: 30000,
      yield: 10.8,
    }
  ],
  commodities: [
    {
      id: '7',
      title: 'Gold Mining Project',
      price: 300000,
      description: 'Operational gold mine with proven reserves and monthly distributions.',
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Commodities',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 40000,
      yield: 10,
    },
    {
      id: '8',
      title: 'Solar Farm Yield',
      price: 200000,
      description: 'Revenue share from utility-scale solar farm with government PPA.',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Commodities',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 35000,
      yield: 9.5,
    },
    {
      id: '9',
      title: 'Agricultural Land',
      price: 180000,
      description: 'Prime agricultural land with long-term lease to organic farming cooperative.',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60',
      priceToken: 'USDC',
      category: 'Commodities',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Standard',
      earnXP: 32000,
      yield: 8.8,
    }
  ],
};
