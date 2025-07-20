import { getContext } from 'hono/context-storage';
import type { HonoContext } from '../ctx';
import { createDriver } from './driver';

// Simple in-memory user connection structure
export interface UserConnection {
  id: string;
  userId: string;
  providerId: 'google';
  email: string;
  name?: string;
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const getActiveConnection = async (): Promise<UserConnection> => {
  const c = getContext<HonoContext>();
  const { sessionUser } = c.var;
  if (!sessionUser) throw new Error('Session Not Found');

  // Since we're not using persistent storage, we'll need to get connection info
  // from the session or auth provider directly
  // This will need to be implemented based on your auth setup
  throw new Error('getActiveConnection needs to be implemented without database');
};

export const connectionToDriver = (activeConnection: UserConnection) => {
  if (!activeConnection.accessToken || !activeConnection.refreshToken) {
    throw new Error(`Invalid connection ${JSON.stringify(activeConnection?.id)}`);
  }

  return createDriver(activeConnection.providerId, {
    auth: {
      userId: activeConnection.userId,
      accessToken: activeConnection.accessToken,
      refreshToken: activeConnection.refreshToken,
      email: activeConnection.email,
    },
  });
};

export const verifyToken = async (token: string) => {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to verify token: ${await response.text()}`);
  }

  const data = (await response.json()) as any;
  return !!data;
};
