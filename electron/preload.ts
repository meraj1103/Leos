import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('leosAPI', {
  getPartitionSession: (partitionId: string) => 
    ipcRenderer.invoke('leos:get-partition-session', partitionId),
  openGoogleLogin: (url?: string) =>
    ipcRenderer.invoke('leos:open-google-login', url),
  platform: process.platform,
});
