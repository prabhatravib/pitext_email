import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HelpCircle,
  LogOut,
  MoonIcon,
  Settings,
  CopyCheckIcon,
  BadgeCheck,
  BanknoteIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useActiveConnection } from '@/hooks/use-connections';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useLoading } from '../context/loading-context';
import { signOut, useSession } from '@/lib/auth-client';
import { CircleCheck, ThreeDots } from '../icons/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { useBilling } from '@/hooks/use-billing';
import { SunIcon } from '../icons/animated/sun';
import { clear as idbClear } from 'idb-keyval';
import { useLocation } from 'react-router-dom';
import { m } from '@/src/paraglide/messages';
import { useTheme } from 'next-themes';
import { useQueryState } from '@/lib/nuqs-replacement';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NavUser() {
  const { data: session } = useSession();
  const [isRendered, setIsRendered] = useState(false);
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const [, setThreadId] = useQueryState('threadId');
  const { customer: billingCustomer, isPro } = useBilling();
  const pathname = useLocation().pathname;
  const queryClient = useQueryClient();
  const { data: activeConnection } = useActiveConnection();
  const { setLoading } = useLoading();

  const getSettingsHref = useCallback(() => {
    const currentPath = pathname;
    return `/settings/general?from=${encodeURIComponent(currentPath)}`;
  }, [pathname]);

  const handleClearCache = useCallback(async () => {
    queryClient.clear();
    await idbClear();
    toast.success('Cache cleared successfully');
  }, []);

  const handleCopyConnectionId = useCallback(async () => {
    await navigator.clipboard.writeText(activeConnection?.id || '');
    toast.success('Connection ID copied to clipboard');
  }, [activeConnection]);

  useEffect(() => setIsRendered(true), []);

  const handleLogout = async () => {
    toast.promise(signOut(), {
      loading: 'Signing out...',
      success: () => 'Signed out successfully!',
      error: 'Error signing out',
      async finally() {
        window.location.href = '/login';
      },
    });
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!isRendered) return null;
  // Don't return null if no session - show demo user instead
  // if (!session) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {state === 'collapsed' ? (
          activeConnection && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer items-center">
                  <div className="relative">
                    <Avatar className="relative left-0.5 size-7 rounded-[5px]">
                      <AvatarImage
                        className="rounded-[5px]"
                        src={activeConnection?.picture || undefined}
                        alt={activeConnection?.name || activeConnection?.email}
                      />

                      <AvatarFallback className="rounded-[5px] text-[10px]">
                        {(activeConnection?.name || activeConnection?.email || '')
                          .split(' ')
                          .map((n: any) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="ml-3 w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-white font-medium dark:bg-[#131313]"
                align="end"
                side={'bottom'}
                sideOffset={8}
              >
                {session && activeConnection && (
                  <>
                    <div className="flex flex-col items-center p-3 text-center">
                      <Avatar className="border-border/50 mb-2 size-14 rounded-xl border">
                        <AvatarImage
                          className="rounded-xl"
                          src={
                            (activeConnection.picture ?? undefined) ||
                            (session.user.image ?? undefined)
                          }
                          alt={activeConnection.name || session.user.name || 'User'}
                        />
                        <AvatarFallback className="rounded-xl">
                          <span>
                            {(activeConnection.name || session.user.name || 'User')
                              .split(' ')
                              .map((n: any) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <div className="flex items-center justify-center gap-0.5 text-sm font-medium">
                          {activeConnection.name || session.user.name || 'User'}
                          {isPro && (
                            <BadgeCheck
                              className="h-4 w-4 text-white dark:text-[#141414]"
                              fill="#1D9BF0"
                            />
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs">{activeConnection.email}</div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <div className="space-y-1">
                  <>
                    <DropdownMenuItem onClick={handleThemeToggle} className="cursor-pointer">
                      <div className="flex w-full items-center gap-2">
                        {theme === 'dark' ? (
                          <MoonIcon className="size-4 opacity-60" />
                        ) : (
                          <SunIcon className="size-4 opacity-60" />
                        )}
                        <p className="text-[13px] opacity-60">{m['common.navUser.appTheme']()}</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={getSettingsHref()} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Settings size={16} className="opacity-60" />
                          <p className="text-[13px] opacity-60">{m['common.actions.settings']()}</p>
                        </div>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <a
                        href="https://discord.gg/mail0"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle size={16} className="opacity-60" />
                          <p className="text-[13px] opacity-60">
                            {m['common.navUser.customerSupport']()}
                          </p>
                        </div>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                      <div className="flex items-center gap-2">
                        <LogOut size={16} className="opacity-60" />
                        <p className="text-[13px] opacity-60">{m['common.actions.logout']()}</p>
                      </div>
                    </DropdownMenuItem>
                  </>
                </div>
                <>
                  <DropdownMenuSeparator className="mt-1" />
                  <div className="text-muted-foreground/60 flex items-center justify-center gap-1 px-2 pb-2 pt-1 text-[10px]">
                    <a href="/privacy" className="hover:underline">
                      Privacy
                    </a>
                    <span>·</span>
                    <a href="/terms" className="hover:underline">
                      Terms
                    </a>
                  </div>
                </>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        ) : (
          <div className="flex w-full items-center gap-3">
            <div className="flex w-full items-center gap-3">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  className="rounded-lg"
                  src={
                    (activeConnection?.picture ?? undefined) ||
                    (session?.user.image ?? undefined)
                  }
                  alt={activeConnection?.name || session?.user.name || 'User'}
                />
                <AvatarFallback className="rounded-lg">
                  <span>
                    {(activeConnection?.name || session?.user.name || 'User')
                      .split(' ')
                      .map((n: any) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-1">
                  <span className="truncate text-sm font-medium">
                    {activeConnection?.name || session?.user.name || 'User'}
                  </span>
                  {isPro && (
                    <BadgeCheck
                      className="h-4 w-4 text-white dark:text-[#141414]"
                      fill="#1D9BF0"
                    />
                  )}
                </div>
                <span className="text-muted-foreground truncate text-xs">
                  {activeConnection?.email || session?.user.email}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
