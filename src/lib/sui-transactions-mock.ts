// Mock Transaction and SuiClient for development
export class Transaction {
  public pure = {
    string: (value: string) => ({ kind: 'pure', value }),
    u64: (value: number) => ({ kind: 'pure', value }),
    address: (value: string) => ({ kind: 'pure', value }),
  };

  public gas = { kind: 'gas' };

  moveCall(params: {
    target: string;
    arguments: any[];
  }) {
    console.log('Mock moveCall:', params);
    return this;
  }

  object(id: string) {
    return { kind: 'object', id };
  }

  splitCoins(gas: any, amounts: any[]) {
    return amounts.map((amount, index) => ({ kind: 'split-coin', amount, index }));
  }
}

export class SuiClient {
  constructor(config: { url: string }) {
    console.log('Mock SuiClient created with URL:', config.url);
  }

  async getOwnedObjects(params: any) {
    console.log('Mock getOwnedObjects called:', params);
    return { data: [] };
  }

  async getObject(params: any) {
    console.log('Mock getObject called:', params);
    return { data: null };
  }
}

export interface QueryClient {
  // Mock interface
}

export const QueryClient = class {
  constructor() {
    console.log('Mock QueryClient created');
  }
};

export const QueryClientProvider: React.FC<{ children: React.ReactNode; client: any }> = ({ children }) => {
  return <>{children}</>;
};
