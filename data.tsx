export interface Lot {
  id: string;
  lotNumber: number;
  title: string;
  description: string;
  image: string;
  startingBid: number;
  watchers: number;
  highestBid: number;
  status?: "Active" | "Sold" | "Unsold" | "Pending";
}

export interface Bidder {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  registrationDate: string;
  depositStatus: boolean;
  status: "Accepted" | "Rejected" | "Blocked";
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  type: "Timed Auction" | "Live Webcast Auction" | "Hybrid Auction";
  status: "Draft" | "Scheduled" | "Live" | "Closed" | "Completed";
  currency: "NGN" | "USD";
  totalBid: number;
  bidCount: number;
  startDate: string;
  endDate: string;
  banner: string;
  lots: Lot[];
  bidders: Bidder[];
}

export const mockAuction: Auction[] = [
  {
    id: "AUC-001",
    title: "Luxury Cars Timed Auction",
    description: "Featuring premium vehicles including Mercedes, BMW, Lexus, and Range Rover.",
    location: "Lagos, Nigeria",
    category: "Automobiles",
    type: "Timed Auction",
    status: "Live",
    currency: "NGN",
    totalBid: 54000000,
    bidCount: 127,
    startDate: "2025-12-01T10:00:00Z",
    endDate: "2025-12-12T18:00:00Z",
    banner: "/images/auctions/luxury-cars.jpeg",
    lots: [
      {
        id: "LOT-101",
        lotNumber: 1,
        title: "2020 Mercedes-Benz GLE 350",
        description: "Clean, low mileage, full option.",
        image: "/images/lots/gle350.webp",
        startingBid: 15000000,
        watchers: 34,
        highestBid: 17200000,
        status: "Active"
      },
      {
        id: "LOT-102",
        lotNumber: 2,
        title: "2019 Lexus RX 350",
        description: "Mint condition with service history.",
        image: "/images/lots/rx350.avif",
        startingBid: 12000000,
        watchers: 22,
        highestBid: 13600000,
        status: "Active"
      }
    ],
    bidders: [
      {
        id: "BID-1",
        name: "John Adewale",
        email: "john@example.com",
        phone: "08030000001",
        image: "/avatars/john.jpg",
        registrationDate: "2025-12-01",
        depositStatus: true,
        status: "Accepted"
      },
      {
        id: "BID-2",
        name: "Sarah Daniel",
        email: "sarah@example.com",
        phone: "08030000002",
        image: "/avatars/sarah.jpg",
        registrationDate: "2025-12-02",
        depositStatus: true,
        status: "Accepted"
      }
    ]
  },
  {
    id: "AUC-002",
    title: "Fine Art Live Webcast Auction",
    description: "Rare paintings, sculptures, and exclusive contemporary art.",
    location: "Abuja, Nigeria",
    category: "Artwork",
    type: "Live Webcast Auction",
    status: "Scheduled",
    currency: "USD",
    totalBid: 0,
    bidCount: 0,
    startDate: "2025-12-22T14:00:00Z",
    endDate: "2025-12-22T16:00:00Z",
    banner: "/images/auctions/fine-art.jpg",
    lots: [
      {
        id: "LOT-201",
        lotNumber: 1,
        title: "African Abstract Painting",
        description: "Original canvas from a renowned Nigerian artist.",
        image: "/images/lots/abstract.jpg",
        startingBid: 5000,
        watchers: 15,
        highestBid: 0
      }
    ],
    bidders: []
  },
  {
    id: "AUC-003",
    title: "Heavy Construction Machinery Auction",
    description: "Excavators, bulldozers, cranes, and industrial equipment.",
    location: "Kano, Nigeria",
    category: "Industrial Equipment",
    type: "Hybrid Auction",
    status: "Closed",
    currency: "NGN",
    totalBid: 232000000,
    bidCount: 89,
    startDate: "2025-12-03T09:00:00Z",
    endDate: "2025-12-07T18:00:00Z",
    banner: "/images/auctions/machinery.jpg",
    lots: [
      {
        id: "LOT-301",
        lotNumber: 10,
        title: "CAT 320 Excavator",
        description: "Fully functional, imported, low usage.",
        image: "/images/lots/cat320.jpeg",
        startingBid: 45000000,
        watchers: 18,
        highestBid: 52000000,
        status: "Active"
      },
      {
        id: "LOT-302",
        lotNumber: 11,
        title: "Komatsu Bulldozer D65",
        description: "Excellent condition with recent maintenance.",
        image: "/images/lots/d65.jpg",
        startingBid: 60000000,
        watchers: 25,
        highestBid: 65000000,
        status: "Active"
      }
    ],
    bidders: [
      {
        id: "BID-11",
        name: "Usman Ibrahim",
        email: "ibrahim@example.com",
        phone: "08030000345",
        image: "/avatars/usman.jpg",
        registrationDate: "2025-12-03",
        depositStatus: false,
        status: "Blocked"
      }
    ]
  },
  {
    id: "AUC-004",
    title: "Electronics & Gadgets Flash Auction",
    description: "Brand new and UK-used phones, laptops, and accessories.",
    location: "Online",
    category: "Electronics",
    type: "Timed Auction",
    status: "Scheduled",
    currency: "NGN",
    totalBid: 0,
    bidCount: 0,
    startDate: "2025-12-15T08:00:00Z",
    endDate: "2025-12-15T20:00:00Z",
    banner: "/images/auctions/electronics.jpg",
    lots: [
      {
        id: "LOT-401",
        lotNumber: 1,
        title: "iPhone 14 Pro Max",
        description: "256GB, deep purple, UK-used grade A.",
        image: "/images/lots/iphone14pm.jpg",
        startingBid: 600000,
        watchers: 12,
        highestBid: 0
      }
    ],
    bidders: []
  },
  {
    id: "AUC-005",
    title: "Vintage & Antique Furniture Auction",
    description: "Vintage sofas, royal chairs, imported center tables, and hand-carved pieces.",
    location: "Ibadan, Nigeria",
    category: "Furniture",
    type: "Live Webcast Auction",
    status: "Draft",
    currency: "USD",
    totalBid: 0,
    bidCount: 0,
    startDate: "2026-01-20T15:00:00Z",
    endDate: "2026-01-20T18:00:00Z",
    banner: "/images/auctions/antique.avif",
    lots: [
      {
        id: "LOT-501",
        lotNumber: 5,
        title: "Hand-Carved Royal Chair",
        description: "Authentic hardwood carving, imported from Kenya.",
        image: "/images/lots/royal-chair.jpg",
        startingBid: 800,
        watchers: 0,
        highestBid: 0
      }
    ],
    bidders: []
  }
];

export const mockActivityFeed = [
  {
    id: "act-1",
    type: "bid" as const,
    bidder: "John Adewale",
    lot: "Lot 1 - Mercedes-Benz GLE 350",
    amount: "₦17,200,000",
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: "act-2",
    type: "registration" as const,
    bidder: "New Bidder",
    lot: "",
    amount: "",
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    id: "act-3",
    type: "bid" as const,
    bidder: "Sarah Daniel",
    lot: "Lot 2 - Lexus RX 350",
    amount: "₦13,600,000",
    timestamp: new Date(Date.now() - 25 * 60000),
  },
  {
    id: "act-4",
    type: "lot_sold" as const,
    bidder: "",
    lot: "Lot 5 - CAT 320 Excavator",
    amount: "₦52,000,000",
    timestamp: new Date(Date.now() - 45 * 60000),
  },
];

export const mockRecentBids = [
  {
    id: "bid-1",
    lot: "Lot 1",
    title: "2020 Mercedes-Benz GLE 350",
    bidder: "John Adewale",
    currentBid: "₦17,200,000",
    timestamp: "5 min ago",
  },
  {
    id: "bid-2",
    lot: "Lot 2",
    title: "2019 Lexus RX 350",
    bidder: "Sarah Daniel",
    currentBid: "₦13,600,000",
    timestamp: "25 min ago",
  },
  {
    id: "bid-3",
    lot: "Lot 10",
    title: "CAT 320 Excavator",
    bidder: "Usman Ibrahim",
    currentBid: "₦52,000,000",
    timestamp: "1 hr ago",
  },
];

export type VerificationStatus = "verified" | "pending" | "suspended";
export type ConsignorTag = "high-value" | "new" | "top-seller";

export interface ConsignorNote {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: string;
}

export interface ConsignedItem {
  id: string;
  name: string;
  sku: string;
  value: number;
  status: "active" | "sold" | "returned";
  listedDate: Date;
}

export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  status: "completed" | "pending" | "failed";
  method: string;
}

export interface Consignor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: VerificationStatus;
  tags: ConsignorTag[];
  itemsCount: number;
  totalValue: number;
  commission: string;
  joinDate: Date;
  bankAccount?: {
    accountHolder: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  currentBalance: number;
  outstandingPayments: number;
  items: ConsignedItem[];
  payments: PaymentRecord[];
  notes: ConsignorNote[];
}

const mockConsignors: Consignor[] = [
  {
    id: "csg-001",
    companyName: "Vintage Collectibles Co.",
    contactName: "Sarah Mitchell",
    email: "sarah@vintagecollectibles.com",
    phone: "+1 (555) 123-4567",
    avatar: "",
    status: "verified",
    tags: ["high-value", "top-seller"],
    itemsCount: 145,
    totalValue: 2850000,
    commission: "15%",
    joinDate: new Date("2023-01-15"),
    bankAccount: {
      accountHolder: "Sarah Mitchell",
      accountNumber: "****5678",
      routingNumber: "021000021",
      bankName: "Chase Bank",
    },
    currentBalance: 45000,
    outstandingPayments: 0,
    items: [
      {
        id: "item-001",
        name: "Rolex Submariner 1960s",
        sku: "ROL-SUB-1960",
        value: 12500,
        status: "active",
        listedDate: new Date("2024-11-01"),
      },
      {
        id: "item-002",
        name: "Antique Mahogany Desk",
        sku: "ANT-DESK-001",
        value: 3200,
        status: "sold",
        listedDate: new Date("2024-10-15"),
      },
    ],
    payments: [
      {
        id: "pay-001",
        date: new Date("2024-12-01"),
        amount: 15000,
        status: "completed",
        method: "Bank Transfer",
      },
    ],
    notes: [
      {
        id: "note-001",
        text: "High-value consignor, excellent communication. Prefers monthly payouts.",
        createdAt: new Date("2024-11-20"),
        createdBy: "Admin",
      },
    ],
  },
  {
    id: "csg-002",
    companyName: "Modern Art Gallery",
    contactName: "Marcus Johnson",
    email: "marcus@modernartgallery.com",
    phone: "+1 (555) 234-5678",
    avatar: "",
    status: "verified",
    tags: ["high-value"],
    itemsCount: 89,
    totalValue: 1650000,
    commission: "12%",
    joinDate: new Date("2023-06-22"),
    bankAccount: {
      accountHolder: "Marcus Johnson",
      accountNumber: "****9012",
      routingNumber: "021000021",
      bankName: "Bank of America",
    },
    currentBalance: 32500,
    outstandingPayments: 5000,
    items: [
      {
        id: "item-003",
        name: "Contemporary Oil Painting",
        sku: "ART-OIL-001",
        value: 8500,
        status: "active",
        listedDate: new Date("2024-11-10"),
      },
    ],
    payments: [
      {
        id: "pay-002",
        date: new Date("2024-11-15"),
        amount: 12000,
        status: "completed",
        method: "Bank Transfer",
      },
    ],
    notes: [],
  },
  {
    id: "csg-003",
    companyName: "Tech Resellers LLC",
    contactName: "David Chen",
    email: "david@techresellers.com",
    phone: "+1 (555) 345-6789",
    avatar: "",
    status: "pending",
    tags: ["new"],
    itemsCount: 34,
    totalValue: 125000,
    commission: "18%",
    joinDate: new Date("2024-12-01"),
    currentBalance: 0,
    outstandingPayments: 0,
    items: [
      {
        id: "item-004",
        name: "MacBook Pro 16\" 2024",
        sku: "TECH-MBP-001",
        value: 2500,
        status: "active",
        listedDate: new Date("2024-12-05"),
      },
    ],
    payments: [],
    notes: [
      {
        id: "note-002",
        text: "Onboarding is in progress. Profile submitted on 12/1/2024.",
        createdAt: new Date("2024-12-02"),
        createdBy: "Admin",
      },
    ],
  },
  {
    id: "csg-004",
    companyName: "Luxury Fashion House",
    contactName: "Isabella Romano",
    email: "isabella@luxuryfashion.com",
    phone: "+1 (555) 456-7890",
    avatar: "",
    status: "verified",
    tags: ["top-seller"],
    itemsCount: 267,
    totalValue: 3200000,
    commission: "10%",
    joinDate: new Date("2022-03-10"),
    bankAccount: {
      accountHolder: "Isabella Romano",
      accountNumber: "****3456",
      routingNumber: "021000021",
      bankName: "Wells Fargo",
    },
    currentBalance: 78000,
    outstandingPayments: 0,
    items: [],
    payments: [
      {
        id: "pay-003",
        date: new Date("2024-12-01"),
        amount: 25000,
        status: "completed",
        method: "Bank Transfer",
      },
    ],
    notes: [],
  },
  {
    id: "csg-005",
    companyName: "Rare Books & Manuscripts",
    contactName: "Robert Williams",
    email: "robert@rarebooks.com",
    phone: "+1 (555) 567-8901",
    avatar: "",
    status: "suspended",
    tags: [],
    itemsCount: 12,
    totalValue: 45000,
    commission: "20%",
    joinDate: new Date("2023-09-05"),
    currentBalance: 8500,
    outstandingPayments: 2000,
    items: [],
    payments: [],
    notes: [
      {
        id: "note-003",
        text: "Account suspended due to policy violation. Review required before reactivation.",
        createdAt: new Date("2024-11-15"),
        createdBy: "Admin",
      },
    ],
  },
  {
    id: "csg-006",
    companyName: "Jewelry & Gems Ltd",
    contactName: "Patricia Gold",
    email: "patricia@jewelrygems.com",
    phone: "+1 (555) 678-9012",
    avatar: "",
    status: "pending",
    tags: ["new", "high-value"],
    itemsCount: 156,
    totalValue: 2100000,
    commission: "14%",
    joinDate: new Date("2024-11-20"),
    currentBalance: 0,
    outstandingPayments: 0,
    items: [],
    payments: [],
    notes: [
      {
        id: "note-004",
        text: "High-value inventory flagged for manual review. Awaiting verification documents.",
        createdAt: new Date("2024-11-25"),
        createdBy: "Admin",
      },
    ],
  },
];

export function getMockConsignors(): Consignor[] {
  return mockConsignors;
}

export function getMockConsignorById(id: string): Consignor | undefined {
  return mockConsignors.find((c) => c.id === id);
}

export function getConsignorStats() {
  const consignors = mockConsignors;
  const totalConsignors = consignors.length;
  const activeConsignors = consignors.filter(
    (c) => c.status === "verified"
  ).length;
  const pendingVerification = consignors.filter(
    (c) => c.status === "pending"
  ).length;
  const totalInventoryValue = consignors.reduce((sum, c) => sum + c.totalValue, 0);

  return {
    totalConsignors,
    activeConsignors,
    pendingVerification,
    totalInventoryValue,
  };
}


export const mockBidders = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    countryCode: 'US',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    reputation: 'excellent',
    totalBids: 156,
    wonAuctions: 42,
    winRate: 27,
    isBlocked: false,
    joinedAt: '2022-03-15',
    lastActive: '2024-01-10',
    reputationHistory: [
      { id: '1', date: '2024-01-05', previousStatus: 'good', newStatus: 'excellent', reason: 'Consistent high-value purchases and perfect payment record' },
      { id: '2', date: '2023-06-12', previousStatus: 'neutral', newStatus: 'good', reason: 'Completed 50+ successful transactions' },
    ],
    biddingHistory: [
      { id: '1', auctionTitle: 'Vintage Rolex Submariner 1968', bidAmount: 12500, date: '2024-01-10', status: 'won' },
      { id: '2', auctionTitle: 'Antique Persian Rug', bidAmount: 3200, date: '2024-01-08', status: 'lost' },
      { id: '3', auctionTitle: 'First Edition Hemingway', bidAmount: 4800, date: '2024-01-05', status: 'active' },
    ],
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Chen',
    email: 'james.chen@email.com',
    phone: '+1 (555) 234-5678',
    country: 'Canada',
    countryCode: 'CA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    reputation: 'good',
    totalBids: 89,
    wonAuctions: 18,
    winRate: 20,
    isBlocked: false,
    joinedAt: '2022-08-20',
    lastActive: '2024-01-09',
    reputationHistory: [
      { id: '1', date: '2023-09-01', previousStatus: 'neutral', newStatus: 'good', reason: 'Reliable payment history over 6 months' },
    ],
    biddingHistory: [
      { id: '1', auctionTitle: 'Modern Art Collection', bidAmount: 8500, date: '2024-01-09', status: 'active' },
      { id: '2', auctionTitle: 'Vintage Guitar Gibson 1959', bidAmount: 15000, date: '2024-01-07', status: 'lost' },
    ],
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Williams',
    email: 'emma.williams@email.com',
    phone: '+44 7700 900123',
    country: 'United Kingdom',
    countryCode: 'GB',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    reputation: 'neutral',
    totalBids: 23,
    wonAuctions: 5,
    winRate: 22,
    isBlocked: false,
    joinedAt: '2023-11-01',
    lastActive: '2024-01-08',
    reputationHistory: [],
    biddingHistory: [
      { id: '1', auctionTitle: 'Silver Tea Set Victorian Era', bidAmount: 1200, date: '2024-01-08', status: 'won' },
    ],
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 345-6789',
    country: 'United States',
    countryCode: 'US',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    reputation: 'warning',
    totalBids: 67,
    wonAuctions: 12,
    winRate: 18,
    isBlocked: false,
    joinedAt: '2022-05-10',
    lastActive: '2024-01-06',
    reputationHistory: [
      { id: '1', date: '2023-12-15', previousStatus: 'good', newStatus: 'warning', reason: 'Late payment on 2 consecutive auctions' },
    ],
    biddingHistory: [
      { id: '1', auctionTitle: 'Classic Car Parts Collection', bidAmount: 2800, date: '2024-01-06', status: 'lost' },
    ],
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+61 400 123 456',
    country: 'Australia',
    countryCode: 'AU',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    reputation: 'excellent',
    totalBids: 234,
    wonAuctions: 78,
    winRate: 33,
    isBlocked: false,
    joinedAt: '2021-09-01',
    lastActive: '2024-01-10',
    reputationHistory: [
      { id: '1', date: '2023-01-20', previousStatus: 'good', newStatus: 'excellent', reason: 'VIP status achieved - 200+ successful bids' },
    ],
    biddingHistory: [
      { id: '1', auctionTitle: 'Rare Coin Collection 1800s', bidAmount: 45000, date: '2024-01-10', status: 'active' },
    ],
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Schmidt',
    email: 'david.schmidt@email.com',
    phone: '+49 170 1234567',
    country: 'Germany',
    countryCode: 'DE',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    reputation: 'poor',
    totalBids: 45,
    wonAuctions: 8,
    winRate: 18,
    isBlocked: true,
    joinedAt: '2022-02-14',
    lastActive: '2023-12-20',
    reputationHistory: [
      { id: '1', date: '2023-12-01', previousStatus: 'warning', newStatus: 'poor', reason: 'Multiple unpaid winning bids' },
      { id: '2', date: '2023-10-15', previousStatus: 'neutral', newStatus: 'warning', reason: 'Failed to complete payment within deadline' },
    ],
    biddingHistory: [
      { id: '1', auctionTitle: 'Vintage Watch Collection', bidAmount: 5600, date: '2023-12-20', status: 'lost' },
    ],
  },
  {
    id: '7',
    firstName: 'Sophie',
    lastName: 'Dubois',
    email: 'sophie.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    country: 'France',
    countryCode: 'FR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    reputation: 'good',
    totalBids: 112,
    wonAuctions: 28,
    winRate: 25,
    isBlocked: false,
    joinedAt: '2022-07-22',
    lastActive: '2024-01-09',
    reputationHistory: [],
    biddingHistory: [
      { id: '1', auctionTitle: 'French Impressionist Painting', bidAmount: 25000, date: '2024-01-09', status: 'active' },
    ],
  },
  {
    id: '8',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1 (555) 456-7890',
    country: 'United States',
    countryCode: 'US',
    reputation: 'banned',
    totalBids: 34,
    wonAuctions: 3,
    winRate: 9,
    isBlocked: true,
    joinedAt: '2023-01-05',
    lastActive: '2023-11-15',
    reputationHistory: [
      { id: '1', date: '2023-11-10', previousStatus: 'poor', newStatus: 'banned', reason: 'Fraudulent activity detected - shill bidding' },
    ],
    biddingHistory: [],
  },
  {
    id: '9',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.tanaka@email.com',
    phone: '+81 90 1234 5678',
    country: 'Japan',
    countryCode: 'JP',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    reputation: 'excellent',
    totalBids: 189,
    wonAuctions: 56,
    winRate: 30,
    isBlocked: false,
    joinedAt: '2021-12-01',
    lastActive: '2024-01-10',
    reputationHistory: [],
    biddingHistory: [
      { id: '1', auctionTitle: 'Japanese Samurai Sword Edo Period', bidAmount: 32000, date: '2024-01-10', status: 'won' },
    ],
  },
  {
    id: '10',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@email.com',
    phone: '+971 50 123 4567',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    reputation: 'good',
    totalBids: 78,
    wonAuctions: 22,
    winRate: 28,
    isBlocked: false,
    joinedAt: '2022-11-20',
    lastActive: '2024-01-07',
    reputationHistory: [],
    biddingHistory: [
      { id: '1', auctionTitle: 'Luxury Watch Patek Philippe', bidAmount: 85000, date: '2024-01-07', status: 'active' },
    ],
  },
  {
    id: '11',
    firstName: 'Maria',
    lastName: 'van der Berg',
    email: 'maria.vanderberg@email.com',
    phone: '+31 6 12345678',
    country: 'Netherlands',
    countryCode: 'NL',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    reputation: 'neutral',
    totalBids: 15,
    wonAuctions: 2,
    winRate: 13,
    isBlocked: false,
    joinedAt: '2024-01-01',
    lastActive: '2024-01-08',
    reputationHistory: [],
    biddingHistory: [],
  },
  {
    id: '12',
    firstName: 'Kevin',
    lastName: 'Ng',
    email: 'kevin.ng@email.com',
    phone: '+65 9123 4567',
    country: 'Singapore',
    countryCode: 'SG',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
    reputation: 'warning',
    totalBids: 56,
    wonAuctions: 9,
    winRate: 16,
    isBlocked: false,
    joinedAt: '2023-03-15',
    lastActive: '2024-01-05',
    reputationHistory: [
      { id: '1', date: '2024-01-02', previousStatus: 'good', newStatus: 'warning', reason: 'Dispute filed on recent transaction' },
    ],
    biddingHistory: [],
  },
];

