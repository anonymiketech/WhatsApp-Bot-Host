export interface Bot {
  id: string;
  name: string;
  status: string;
  botTypeId: string | null;
  coinsPerMonth: number;
  expiresAt: string | null;
  createdAt: string;
}
