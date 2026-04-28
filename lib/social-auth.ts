export type SocialProvider = "google" | "facebook";

// ─── Type declarations ────────────────────────────────────────────────────────

type GoogleNotification = {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason?: () => string;
  getDismissedReason?: () => string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
            itp_support?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (callback?: (n: GoogleNotification) => void) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            hint?: string;
            prompt?: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: { type: string }) => void;
          }) => { requestAccessToken: (overrides?: { hint?: string; prompt?: string }) => void };
        };
      };
    };
    FB?: {
      init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { accessToken: string };
          status: string;
        }) => void,
        options?: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

// ─── Script loaders ───────────────────────────────────────────────────────────

function loadScript(src: string, id?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) { resolve(); return; }
    if (!id && document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement("script");
    script.src = src;
    if (id) script.id = id;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export function loadGoogleGIS(): Promise<void> {
  return loadScript("https://accounts.google.com/gsi/client");
}

export function loadFacebookSDK(): Promise<void> {
  if (typeof window !== "undefined" && window.FB) return Promise.resolve();
  return new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      if (!appId) { reject(new Error("Facebook App ID not configured")); return; }
      window.FB!.init({ appId, cookie: true, xfbml: false, version: "v18.0" });
      resolve();
    };
    loadScript("https://connect.facebook.net/en_US/sdk.js", "facebook-jssdk").catch(reject);
  });
}

// ─── Google token client (returns OAuth2 access_token for Socialite) ─────────
// Requires: Authorized JavaScript origins in GCP Console (no redirect URI).

function requestGoogleAccessToken(hint?: string): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      // Empty prompt = silent if consent already granted; account picker otherwise
      prompt: hint ? "" : "select_account",
      hint,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error ?? "Google sign-in failed"));
        } else {
          resolve(response.access_token);
        }
      },
      error_callback: (error) => {
        reject(new Error(error.type === "popup_closed" ? "cancelled" : error.type));
      },
    });
    client.requestAccessToken();
  });
}

// ─── getGoogleToken — button-triggered ───────────────────────────────────────

export async function getGoogleToken(): Promise<string> {
  await loadGoogleGIS();
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    throw new Error("Google client ID is not configured");
  }
  return requestGoogleAccessToken();
}

// ─── One Tap overlay — auto-shown on page load ────────────────────────────────
// The backend accepts the ID token (JWT credential) directly — no popup needed.
// One Tap fires → credential sent straight to backend → seamless sign-in.

export async function promptGoogleOneTap(
  onSuccess: (idToken: string) => void,
): Promise<void> {
  try {
    await loadGoogleGIS();
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        // response.credential is the signed ID token JWT — send it directly
        onSuccess(response.credential);
      },
      cancel_on_tap_outside: true,
      itp_support: true,          // Safari: use redirect-based flow to work around ITP
      use_fedcm_for_prompt: true, // Chrome Android: use browser-native FedCM UI
    });

    window.google!.accounts.id.prompt(() => {
      // Silently ignore — One Tap is a progressive enhancement; buttons are fallback.
    });
  } catch {
    // Never surface One Tap errors
  }
}


// ─── Facebook ─────────────────────────────────────────────────────────────────

export async function getFacebookToken(): Promise<string> {
  await loadFacebookSDK();
  return new Promise((resolve, reject) => {
    window.FB!.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          resolve(response.authResponse.accessToken);
        } else {
          reject(new Error("cancelled"));
        }
      },
      { scope: "email,public_profile" }
    );
  });
}

export async function getSocialToken(provider: SocialProvider): Promise<string> {
  return provider === "google" ? getGoogleToken() : getFacebookToken();
}
