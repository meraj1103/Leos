import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('leosAPI', {
  getPartitionSession: (partitionId: string) => 
    ipcRenderer.invoke('leos:get-partition-session', partitionId),
  platform: process.platform,
});
