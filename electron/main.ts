import { app, BrowserWindow, session, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0e0f12',
    title: 'Leos - Universal AI Cockpit',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true, // Enables isolated multi-account <webview> partitions
    },
  });

  // Handle Chromium media permissions (Microphone for voice dictation & talk mode)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      // Approve microphone access for voice conversations
      callback(true);
      return;
    }
    callback(false);
  });

  // Allow F12 or Ctrl+Shift+I to toggle DevTools for debugging
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow?.webContents.toggleDevTools();
    }
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('Leos failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Load Vite dev server or production bundle
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Multi-partition session configurator
ipcMain.handle('leos:get-partition-session', async (_event, partitionId: string) => {
  const customSession = session.fromPartition(partitionId);
  // Set clean modern browser user-agent to ensure Google SSO and web models operate normally
  customSession.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  );
  return { partitionId, initialized: true };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
