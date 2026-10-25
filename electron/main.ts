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
    icon: path.join(__dirname, '../public/logo.svg'),
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

  // Handle popup windows (e.g., Google OAuth Sign-In popups)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 520,
        height: 680,
        title: 'Sign in with Google - Leos Cockpit',
        autoHideMenuBar: true,
        backgroundColor: '#ffffff',
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          partition: 'persist:google_account',
        },
      },
    };
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

const CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Ensure all web contents use a genuine Chrome user-agent so Google login doesn't block with "disallowed_useragent"
app.on('web-contents-created', (_event, contents) => {
  contents.setUserAgent(CHROME_USER_AGENT);
});

// Multi-partition session configurator
ipcMain.handle('leos:get-partition-session', async (_event, partitionId: string) => {
  const customSession = session.fromPartition(partitionId);
  customSession.setUserAgent(CHROME_USER_AGENT);
  return { partitionId, initialized: true };
});

// Real Google Sign-In Window Opener
ipcMain.handle('leos:open-google-login', async (_event, customUrl?: string) => {
  const authUrl = customUrl || 'https://accounts.google.com/signin';
  const authWindow = new BrowserWindow({
    width: 520,
    height: 680,
    title: 'Sign in with Google - Leos Cockpit',
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      partition: 'persist:google_account',
    },
  });

  authWindow.webContents.setUserAgent(CHROME_USER_AGENT);
  await authWindow.loadURL(authUrl);
  return { success: true, url: authUrl };
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
