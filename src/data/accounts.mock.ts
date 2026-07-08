import { getDealerGroup } from "@/data/lookups";
import type { Account, AccountManager } from "@/types/account";

const ACCOUNT_MANAGERS: AccountManager[] = [
  { id: "am-1", name: "Sarah Chen", initials: "SC" },
  { id: "am-2", name: "Marcus Johnson", initials: "MJ" },
  { id: "am-3", name: "Emily Rodriguez", initials: "ER" },
  { id: "am-4", name: "David Kim", initials: "DK" },
  { id: "am-5", name: "Lisa Thompson", initials: "LT" },
  { id: "am-6", name: "James Wilson", initials: "JW" },
  { id: "am-7", name: "Olivia Martinez", initials: "OM" },
  { id: "am-8", name: "Ryan O'Connor", initials: "RO" },
  { id: "am-9", name: "Priya Nair", initials: "PN" },
  { id: "am-10", name: "Daniel Foster", initials: "DF" },
  { id: "am-11", name: "Hannah Lee", initials: "HL" },
  { id: "am-12", name: "Chris Bennett", initials: "CB" },
];

interface AccountSeed {
  dealerName: string;
  accountManagerIndex: number;
  isSmartMarketingEnabled: boolean;
  eligibility: Account["eligibility"];
}

/** Eligibility and smart marketing are independent: eligible accounts may be on or off. */
const ACCOUNT_SEEDS: AccountSeed[] = [
  {
    dealerName: "Ikon Motors North",
    accountManagerIndex: 0,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Ikon Motors South",
    accountManagerIndex: 1,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Ikon Motors West",
    accountManagerIndex: 2,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Ikon Motors East",
    accountManagerIndex: 3,
    isSmartMarketingEnabled: false,
    eligibility: "not_eligible",
  },
  {
    dealerName: "Premier Auto Group",
    accountManagerIndex: 4,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Summit Chevrolet",
    accountManagerIndex: 5,
    isSmartMarketingEnabled: false,
    eligibility: "not_eligible",
  },
  {
    dealerName: "Lakeside Honda",
    accountManagerIndex: 6,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Metro Toyota",
    accountManagerIndex: 7,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Valley Ford",
    accountManagerIndex: 8,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Coastal Nissan",
    accountManagerIndex: 9,
    isSmartMarketingEnabled: false,
    eligibility: "not_eligible",
  },
  {
    dealerName: "Heritage BMW",
    accountManagerIndex: 10,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Gateway Hyundai",
    accountManagerIndex: 11,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Ridgeline Kia",
    accountManagerIndex: 0,
    isSmartMarketingEnabled: false,
    eligibility: "not_eligible",
  },
  {
    dealerName: "Horizon Mazda",
    accountManagerIndex: 1,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Pioneer Subaru",
    accountManagerIndex: 2,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Crown Chrysler Jeep",
    accountManagerIndex: 3,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Atlas Volkswagen",
    accountManagerIndex: 4,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Silverline Mercedes-Benz",
    accountManagerIndex: 5,
    isSmartMarketingEnabled: false,
    eligibility: "not_eligible",
  },
  {
    dealerName: "Northstar Lexus",
    accountManagerIndex: 6,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Redwood Audi",
    accountManagerIndex: 7,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Beacon Acura",
    accountManagerIndex: 8,
    isSmartMarketingEnabled: false,
    eligibility: "not_eligible",
  },
  {
    dealerName: "Ironwood GMC",
    accountManagerIndex: 9,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Sunset Buick",
    accountManagerIndex: 10,
    isSmartMarketingEnabled: true,
    eligibility: "eligible",
  },
  {
    dealerName: "Evergreen Cadillac",
    accountManagerIndex: 11,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Harbor Lincoln",
    accountManagerIndex: 0,
    isSmartMarketingEnabled: false,
    eligibility: "eligible",
  },
  {
    dealerName: "Summit Dodge Ram",
    accountManagerIndex: 1,
    isSmartMarketingEnabled: false,
    eligibility: "not_eligible",
  },
];

const DEALER_GROUP_OVERRIDES: Record<string, string> = {
  "Lakeside Honda": "Lakeside Auto Group",
  "Metro Toyota": "Metro Automotive",
  "Valley Ford": "Valley Motor Company",
  "Coastal Nissan": "Coastal Auto Group",
  "Heritage BMW": "Heritage Luxury Motors",
  "Gateway Hyundai": "Gateway Auto Group",
  "Ridgeline Kia": "Ridgeline Motors",
  "Horizon Mazda": "Horizon Auto Group",
  "Pioneer Subaru": "Pioneer Automotive",
  "Crown Chrysler Jeep": "Crown Automotive Group",
  "Atlas Volkswagen": "Atlas Motor Group",
  "Silverline Mercedes-Benz": "Silverline Luxury Group",
  "Northstar Lexus": "Northstar Luxury Motors",
  "Redwood Audi": "Redwood Premium Auto",
  "Beacon Acura": "Beacon Auto Group",
  "Ironwood GMC": "Ironwood Truck Group",
  "Sunset Buick": "Sunset Automotive",
  "Evergreen Cadillac": "Evergreen Luxury Group",
  "Harbor Lincoln": "Harbor Premium Motors",
  "Summit Dodge Ram": "Summit Automotive Group",
};

function slugifyDealer(dealerName: string): string {
  return dealerName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getAccountGroupName(dealerName: string): string {
  return DEALER_GROUP_OVERRIDES[dealerName] ?? getDealerGroup(dealerName);
}

export const mockAccounts: Account[] = ACCOUNT_SEEDS.map((seed) => ({
  id: `account-${slugifyDealer(seed.dealerName)}`,
  dealerName: seed.dealerName,
  groupName: getAccountGroupName(seed.dealerName),
  isSmartMarketingEnabled: seed.isSmartMarketingEnabled,
  accountManager:
    ACCOUNT_MANAGERS[seed.accountManagerIndex] ?? ACCOUNT_MANAGERS[0],
  eligibility: seed.eligibility,
}));
