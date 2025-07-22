import { useAutumn, useCustomer } from 'autumn-js/react';
import { signOut } from '@/lib/auth-client';
import { useEffect, useMemo } from 'react';

type FeatureState = {
  total: number;
  remaining: number;
  unlimited: boolean;
  enabled: boolean;
  usage: number;
  nextResetAt: number | null;
  interval: string;
  included_usage: number;
};

type Features = {
  chatMessages: FeatureState;
  connections: FeatureState;
  brainActivity: FeatureState;
};

const DEFAULT_FEATURES: Features = {
  chatMessages: {
    total: 0,
    remaining: 0,
    unlimited: false,
    enabled: false,
    usage: 0,
    nextResetAt: null,
    interval: '',
    included_usage: 0,
  },
  connections: {
    total: 0,
    remaining: 0,
    unlimited: false,
    enabled: false,
    usage: 0,
    nextResetAt: null,
    interval: '',
    included_usage: 0,
  },
  brainActivity: {
    total: 0,
    remaining: 0,
    unlimited: false,
    enabled: false,
    usage: 0,
    nextResetAt: null,
    interval: '',
    included_usage: 0,
  },
};

const FEATURE_IDS = {
  CHAT: 'chat-messages',
  CONNECTIONS: 'connections',
  BRAIN: 'brain-activity',
} as const;

const PRO_PLANS = ['pro-example', 'pro_annual', 'team', 'enterprise'] as const;

export const useBilling = () => {
  // For demo mode, return mock billing data instead of making tRPC calls
  const mockCustomer = {
    data: {
      id: 'demo-customer',
      email: 'demo@gmail.com',
      name: 'Demo User',
      features: DEFAULT_FEATURES,
      subscription: null,
    },
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };

  const mockAutumn = {
    attach: () => Promise.resolve(),
    track: () => Promise.resolve(),
    openBillingPortal: () => Promise.resolve(),
  };

  // Use mock data for now to ensure the interface loads
  return {
    customer: mockCustomer.data,
    isLoading: mockCustomer.isLoading,
    error: mockCustomer.error,
    refetch: mockCustomer.refetch,
    attach: mockAutumn.attach,
    track: mockAutumn.track,
    openBillingPortal: mockAutumn.openBillingPortal,
    isPro: false, // Demo mode is not pro
    chatMessages: DEFAULT_FEATURES.chatMessages, // Add this to fix the undefined error
  };
};
