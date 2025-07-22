import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SettingsCard } from '@/components/settings/settings-card';

import { useSession, authClient } from '@/lib/auth-client';
import { useTRPC } from '@/providers/query-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation } from '@tanstack/react-query';
import { Trash, Unplug } from 'lucide-react';
import { useThreads } from '@/hooks/use-threads';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { m } from '@/src/paraglide/messages';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ConnectionsPage() {
  const { refetch } = useSession();
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  const trpc = useTRPC();
  const { mutateAsync: deleteConnection } = useMutation(trpc.connections.delete.mutationOptions());
  const [{ refetch: refetchThreads }] = useThreads();

  // For Gmail-only version, we'll show a simple Gmail connection status
  const gmailConnection = {
    id: 'gmail',
    name: 'Gmail',
    email: 'user@gmail.com', // This will be replaced with actual user email
    providerId: 'google',
    picture: null,
  };

  const disconnectAccount = async (connectionId: string) => {
    await deleteConnection(
      { connectionId },
      {
        onError: (error) => {
          console.error('Error disconnecting account:', error);
          toast.error(m['pages.settings.connections.disconnectError']());
        },
      },
    );
    toast.success(m['pages.settings.connections.disconnectSuccess']());
    refetch();
    void refetchThreads();
  };

  return (
    <div className="grid gap-6">
      <SettingsCard
        title={m['pages.settings.connections.title']()}
        description="Manage your Gmail connection"
      >
        <div className="space-y-6">
          <div className="lg: grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <div className="bg-popover flex items-center justify-between rounded-lg border p-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                  <svg className="size-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-medium">{gmailConnection.name}</span>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Tooltip
                      delayDuration={0}
                      open={openTooltip === gmailConnection.id}
                      onOpenChange={(open) => {
                        if (window.innerWidth <= 768) {
                          setOpenTooltip(open ? gmailConnection.id : null);
                        }
                      }}
                    >
                      <TooltipTrigger asChild>
                        <span
                          className="max-w-[180px] cursor-default truncate sm:max-w-[240px] md:max-w-[300px]"
                          onClick={() => {
                            if (window.innerWidth <= 768) {
                              setOpenTooltip(
                                openTooltip === gmailConnection.id ? null : gmailConnection.id,
                              );
                            }
                          }}
                        >
                          {gmailConnection.email}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="select-all">
                        <div className="font-mono">{gmailConnection.email}</div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary ml-4 shrink-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent showOverlay>
                    <DialogHeader>
                      <DialogTitle>
                        {m['pages.settings.connections.disconnectTitle']()}
                      </DialogTitle>
                      <DialogDescription>
                        {m['pages.settings.connections.disconnectDescription']()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-4">
                      <DialogClose asChild>
                        <Button variant="outline">
                          {m['pages.settings.connections.cancel']()}
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={() => disconnectAccount(gmailConnection.id)}>
                          {m['pages.settings.connections.remove']()}
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start">
            <Button
              variant="outline"
              onClick={async () => {
                // Validate window.location.origin before using it
                const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                if (!origin || origin === 'undefined' || origin === 'null') {
                  console.error('Invalid window.location.origin');
                  return;
                }

                await authClient.linkSocial({
                  provider: 'google',
                  callbackURL: `${origin}/settings/connections`,
                });
              }}
            >
              Connect Gmail Account
            </Button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
