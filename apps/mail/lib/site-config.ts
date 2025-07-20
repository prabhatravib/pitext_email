const TITLE = 'Zero';
const DESCRIPTION =
  'Experience email the way you want with 0 - the first open source email app that puts your privacy and safety first.';

const appUrl = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;

export const siteConfig = {
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
  },
  applicationName: 'Zero',
  creator: '@nizzyabi @bruvimtired @ripgrim @needleXO @dakdevs @mrgsub',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `${appUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  category: 'Email Client',
  alternates: {
    canonical: appUrl,
  },
  keywords: [
    'Mail',
    'Email',
    'Open Source',
    'Email Client',
    'Gmail Alternative',
    'Webmail',
    'Secure Email',
    'Email Management',
    'Email Platform',
    'Communication Tool',
    'Productivity',
    'Business Email',
    'Personal Email',
    'Mail Server',
    'Email Software',
    'Collaboration',
    'Message Management',
    'Digital Communication',
    'Email Service',
    'Web Application',
  ],
  //   metadataBase: new URL(appUrl),
};
