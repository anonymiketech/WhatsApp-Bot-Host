export interface Bot {
  id: string;
  name: string;
  status: string;
  suspended: boolean;
  botTypeId: string | null;
  pterodactylServerId: string | null;
  panelUrl: string | null;
  coinsPerMonth: number;
  expiresAt: string | null;
  createdAt: string;
}
