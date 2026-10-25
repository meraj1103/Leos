import { GoogleUserProfile, LeosAccount } from '../types';

export const GOOGLE_CLIENT_ID_KEY = 'leos-google-client-id';
export const GOOGLE_GEMINI_KEY = 'leos-gemini-key';
export const GOOGLE_PROFILE_KEY = 'leos-google-profile';
export const GOOGLE_TOKEN_KEY = 'leos-google-token';

class GoogleAuthService {
  private gisLoadedPromise: Promise<boolean> | null = null;

  /**
   * Ensures Google Identity Services (GIS) client script is loaded in the DOM.
   */
  public ensureGISLoaded(): Promise<boolean> {
    if (typeof window === 'undefined') return Promise.resolve(false);
    if (window.google?.accounts?.id && window.google?.accounts?.oauth2) {
      return Promise.resolve(true);
    }

    if (this.gisLoadedPromise) return this.gisLoadedPromise;

    this.gisLoadedPromise = new Promise((resolve) => {
      // Check if tag already exists
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.google?.accounts?.oauth2) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts > 30) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.google?.accounts?.oauth2) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts > 30) {
            clearInterval(interval);
            resolve(false);
          }
        }, 50);
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });

    return this.gisLoadedPromise;
  }

  /**
   * Get stored Google Client ID
   */
  public getClientId(): string {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(GOOGLE_CLIENT_ID_KEY);
      if (stored && stored.trim()) return stored.trim();
    }
    // Fallback to Vite env if defined
    return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  }

  /**
   * Save Google Client ID locally
   */
  public setClientId(clientId: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
    }
  }

  /**
   * Get Google Gemini API Key
   */
  public getGeminiKey(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(GOOGLE_GEMINI_KEY) || '';
    }
    return '';
  }

  /**
   * Save Google Gemini API Key locally
   */
  public setGeminiKey(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(GOOGLE_GEMINI_KEY, key.trim());
    }
  }

  /**
   * Parse real JWT token returned by Google Identity Services
   */
  public parseJwt(token: string): GoogleUserProfile | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonPayload);
      return {
        sub: parsed.sub,
        email: parsed.email,
        name: parsed.name,
        picture: parsed.picture,
        email_verified: parsed.email_verified,
        given_name: parsed.given_name,
        family_name: parsed.family_name,
      };
    } catch (e) {
      console.error('Failed to parse Google JWT:', e);
      return null;
    }
  }

  /**
   * Fetch authenticated user info using Google OAuth Access Token
   */
  public async fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserProfile> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Google Userinfo error: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Verify Gemini API Key directly against Google's API endpoint
   */
  public async verifyGeminiApiKey(apiKey: string): Promise<{ success: boolean; models?: string[]; error?: string }> {
    if (!apiKey.trim()) {
      return { success: false, error: 'API key is empty.' };
    }
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`,
        { method: 'GET' }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data.error?.message || `Google API error (Status ${res.status})`,
        };
      }
      const data = await res.json();
      const modelNames = Array.isArray(data.models) ? data.models.map((m: any) => m.name) : [];
      return { success: true, models: modelNames };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  }

  /**
   * Open the real Google Sign-in page in an authentic browser popup or native Electron window
   */
  public async openGoogleSignInPage(url: string = 'https://accounts.google.com/signin'): Promise<void> {
    if (window.leosAPI?.openGoogleLogin) {
      try {
        await window.leosAPI.openGoogleLogin(url);
        return;
      } catch (e) {
        console.warn('Native Electron Google login window failed, falling back to browser window:', e);
      }
    }

    const width = 520;
    const height = 680;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
    window.open(
      url,
      'GoogleSignIn',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );
  }

  /**
   * Launch Real Google OAuth 2.0 Sign-In Flow
   * Returns authenticated profile or flags that a Client ID setup is needed.
   */
  public async launchGoogleSignIn(options?: { promptSelectAccount?: boolean }): Promise<{
    success: boolean;
    needsClientId?: boolean;
    profile?: GoogleUserProfile;
    accessToken?: string;
    error?: string;
  }> {
    const clientId = this.getClientId();

    // If no client ID configured yet, open real Google account page and return needsClientId
    if (!clientId) {
      await this.openGoogleSignInPage('https://accounts.google.com/signin');
      return {
        success: false,
        needsClientId: true,
        error: 'Google OAuth Client ID is required for 1-click token exchange.',
      };
    }

    await this.ensureGISLoaded();

    if (!window.google?.accounts?.oauth2) {
      // Fallback: direct OAuth authorization URL in popup
      const redirectUri = window.location.origin;
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=${
        options?.promptSelectAccount ? 'select_account' : 'consent'
      }&nonce=${Date.now()}`;

      await this.openGoogleSignInPage(oauthUrl);
      return {
        success: false,
        needsClientId: false,
        error: 'Launched Google OAuth in dedicated sign-in window.',
      };
    }

    // Google Identity Services (GIS) Token Client
    return new Promise((resolve) => {
      try {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          prompt: options?.promptSelectAccount ? 'select_account' : '',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              resolve({
                success: false,
                error: tokenResponse.error_description || tokenResponse.error,
              });
              return;
            }

            try {
              const profile = await this.fetchGoogleUserInfo(tokenResponse.access_token);
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(GOOGLE_TOKEN_KEY, tokenResponse.access_token);
                localStorage.setItem(GOOGLE_PROFILE_KEY, JSON.stringify(profile));
              }
              resolve({
                success: true,
                profile,
                accessToken: tokenResponse.access_token,
              });
            } catch (fetchErr: any) {
              resolve({
                success: false,
                error: `Failed to fetch user profile: ${fetchErr.message || fetchErr}`,
              });
            }
          },
          error_callback: (err: any) => {
            resolve({
              success: false,
              error: err?.message || 'Google Sign-In canceled or failed.',
            });
          },
        });

        client.requestAccessToken({ prompt: options?.promptSelectAccount ? 'select_account' : '' });
      } catch (err: any) {
        resolve({
          success: false,
          error: err.message || 'Failed to initialize Google token client.',
        });
      }
    });
  }

  /**
   * Helper to format a GoogleUserProfile into a LeosAccount object
   */
  public createAccountFromGoogleProfile(profile: GoogleUserProfile, accessToken?: string): Omit<LeosAccount, 'partition'> & { id: string } {
    const isWork = !profile.email.endsWith('@gmail.com');
    return {
      id: `google-${profile.sub}`,
      name: profile.name || profile.email.split('@')[0],
      email: profile.email,
      avatarUrl: profile.picture,
      type: isWork ? 'work' : 'personal',
      isActive: true,
      authProvider: 'google',
      googleId: profile.sub,
      googleAccessToken: accessToken,
      connectedModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'chatgpt-4o-free', 'claude-3.5-sonnet'],
      tokenStatus: 'healthy',
    };
  }
}

export const googleAuthService = new GoogleAuthService();
