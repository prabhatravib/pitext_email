import { LoginClient } from './login-client';

export default function LoginPage() {
  // Provide default props since clientLoader was removed
  const defaultProviders = [{
    id: 'google',
    name: 'Gmail',
    enabled: true,
    required: true,
    envVarStatus: [],
  }];
  
  return <LoginClient providers={defaultProviders} isProd={!import.meta.env.DEV} />;
}
