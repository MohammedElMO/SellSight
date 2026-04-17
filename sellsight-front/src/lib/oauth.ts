import type { OAuthProvider } from '@shared/types';

function getRedirectUri(provider: OAuthProvider): string {
  return `${window.location.origin}/oauth/callback?provider=${provider}`;
}

export function startGoogleOAuth() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
  }

  const redirectUri = getRedirectUri('GOOGLE');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function startSlackOAuth() {
  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_SLACK_CLIENT_ID is not configured');
  }

  const redirectUri = getRedirectUri('SLACK');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    user_scope: 'openid,email,profile',
  });

  window.location.href = `https://slack.com/openid/connect/authorize?${params}`;
}
