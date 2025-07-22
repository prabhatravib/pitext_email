import { OnboardingWrapper } from '@/components/onboarding';

import { NotificationProvider } from '@/components/party';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { Outlet, } from 'react-router-dom';


export default function MailLayout() {
  return (
    <>
      <AppSidebar />
      <div className="bg-sidebar dark:bg-sidebar w-full">
        <Outlet />
      </div>
      <OnboardingWrapper />
      <NotificationProvider />
    </>
  );
}
