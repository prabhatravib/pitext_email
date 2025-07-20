import type { MailManager, ManagerConfig } from './types';
import { GoogleMailManager } from './google';

export const createDriver = (
  provider: string,
  config: ManagerConfig,
): MailManager => {
  if (provider === 'google') {
    return new GoogleMailManager(config);
  }
  throw new Error(`Provider "${provider}" not supported. Only Google is supported.`);
};
