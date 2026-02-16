
export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface HistoryEntry {
  date: string;
  bill: number;
  points: number;
  type: 'earn' | 'redeem';
  discountApplied?: number;
}

export interface Customer {
  mobile: string;
  name: string;
  pin: string;
  points: number;
  totalSpent: number;
  history: HistoryEntry[];
  spendingTier: Tier;
  pointsTier: Tier;
}

export interface Settings {
  spendingTiers: {
    [key in Tier]: number;
  };
  pointsTiers: {
    [key in Tier]: number;
  };
  discounts: {
    [key in Tier]: number;
  };
}

export interface SMSLog {
  date: string;
  recipientName: string;
  recipientMobile: string;
  message: string;
  status: 'Sent' | 'Failed';
}
