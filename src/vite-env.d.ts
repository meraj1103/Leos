/// <reference types="vite/client" />

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: any) => void;
        prompt: (callback?: (notification: any) => void) => void;
        renderButton: (parent: HTMLElement, options: any) => void;
        revoke: (hint: string, callback?: (done: any) => void) => void;
      };
      oauth2: {
        initTokenClient: (config: any) => {
          requestAccessToken: (overrideConfig?: any) => void;
        };
        initCodeClient: (config: any) => {
          requestCode: () => void;
        };
      };
    };
  };
  leosAPI?: {
    getPartitionSession: (partitionId: string) => Promise<{ partitionId: string; initialized: boolean }>;
    openGoogleLogin?: (url?: string) => Promise<{ success: boolean; url?: string }>;
    platform: string;
  };
}
