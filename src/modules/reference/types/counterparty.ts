/** A counterparty as the GridTrade API returns it (GET /api/counterparties). */
export interface Counterparty {
  id: number;
  code: string;
  name: string;
  type: 'Industrial' | 'Commercial' | 'Generator' | 'Utility' | 'Trader';
  region?: 'North' | 'West' | 'South' | 'East' | 'Central' | null;
  /** INR lakh */
  creditLimit?: number | null;
  enabled: boolean;
  isSystem?: boolean;
}
