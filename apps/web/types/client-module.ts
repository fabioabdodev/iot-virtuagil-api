export type ClientModuleItem = {
  id: string;
  clientId: string;
  itemKey: string;
  moduleKey: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ClientModule = {
  id: string;
  clientId: string;
  moduleKey: 'ambiental' | 'acionamento' | 'energia';
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  items: ClientModuleItem[];
};
