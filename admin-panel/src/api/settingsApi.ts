import { api } from './axios';

export interface PlatformSettings {
  _id: string;
  ngoName: string;
  tagline: string;
  creditPerApproval: number;
  welcomeBonus: number;
  updatedAt?: string;
}

export const settingsApi = {
  get: async () => (await api.get<{ success: boolean; data: { settings: PlatformSettings } }>('/admin/settings')).data.data.settings,
  update: async (settings: Partial<Pick<PlatformSettings, 'ngoName' | 'tagline' | 'creditPerApproval' | 'welcomeBonus'>>) =>
    (await api.patch<{ success: boolean; data: { settings: PlatformSettings } }>('/admin/settings', settings)).data.data.settings,
};
