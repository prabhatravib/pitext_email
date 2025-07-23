import {
  Archive2,
  ExclamationCircle,
  GroupPeople,
  Star2,
  Trash,
  PencilCompose,
} from '../icons/icons';
import { memo, useCallback, useEffect, useMemo, useRef, type ComponentProps } from 'react';
import { useOptimisticThreadState } from '@/components/mail/optimistic-thread-state';
import { focusedIndexAtom, useMailNavigation } from '@/hooks/use-mail-navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsFetching, type UseQueryResult } from '@tanstack/react-query';
import type { MailSelectMode, ParsedMessage, ThreadProps } from '@/types';
import type { ParsedDraft } from '../../../server/src/lib/driver/types';
import { ThreadContextMenu } from '@/components/context/thread-context';
import { useOptimisticActions } from '@/hooks/use-optimistic-actions';
import { useMail, type Config } from '@/components/mail/use-mail';
import { type ThreadDestination } from '@/lib/thread-actions';
import { useThread, useThreads } from '@/hooks/use-threads';
import { useSearchValue } from '@/hooks/use-search-value';
import { EmptyStateIcon } from '../icons/empty-state-svg';
import { highlightText } from '@/lib/email-utils.client';
import { cn, FOLDERS, formatDate } from '@/lib/utils';
import { Avatar } from '../ui/avatar';

import { useTRPC } from '@/providers/query-provider';
import { useThreadLabels } from '@/hooks/use-labels';

import { useSettings } from '@/hooks/use-settings';

import { useKeyState } from '@/hooks/use-hot-key';
import { VList, type VListHandle } from 'virtua';
import { BimiAvatar } from '../ui/bimi-avatar';
import { RenderLabels } from './render-labels';
import { Badge } from '@/components/ui/badge';
import { useDraft } from '@/hooks/use-drafts';
import { Check, Star } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

import { m } from '@/src/paraglide/messages';
import { useParams } from 'react-router-dom';

import { Button } from '../ui/button';
import { useQueryState } from '@/lib/nuqs-replacement';
import { Categories } from './mail';
import { useAtom } from 'jotai';

const Thread = memo(
  function Thread({
    message,
    onClick,
    isKeyboardFocused,
    index,
  }: ThreadProps & { index?: number }) {
    const [searchValue] = useSearchValue();
    const { folder } = useParams<{ folder: string }>();
    const [, threads] = useThreads();
    const [threadId] = useQueryState('threadId');
    const { data: getThreadData, isGroupThread, latestDraft } = useThread(message.id);
    const [id, setThreadId] = useQueryState('threadId');
    const [focusedIndex, setFocusedIndex] = useAtom(focusedIndexAtom);

    const { latestMessage, idToUse, cleanName } = useMemo(() => {
      const latestMessage = getThreadData?.latest;
      const idToUse = latestMessage?.threadId ?? latestMessage?.id;
      const cleanName = latestMessage?.sender?.name
        ? latestMessage.sender.name.trim().replace(/^['"]|['"]$/g, '')
        : '';

      return { latestMessage, idToUse, cleanName };
    }, [getThreadData?.latest]);

    const optimisticState = useOptimisticThreadState(idToUse ?? '');

    const { displayStarred, displayImportant, displayUnread, optimisticLabels, emailContent } =
      useMemo(() => {
        const emailContent = getThreadData?.latest?.body;
        const displayStarred =
          optimisticState.optimisticStarred !== null
            ? optimisticState.optimisticStarred
            : (getThreadData?.latest?.tags?.some((tag) => tag.name === 'STARRED') ?? false);

        const displayImportant =
          optimisticState.optimisticImportant !== null
            ? optimisticState.optimisticImportant
            : (getThreadData?.latest?.tags?.some((tag) => tag.name === 'IMPORTANT') ?? false);

        const displayUnread =
          optimisticState.optimisticRead !== null
            ? !optimisticState.optimisticRead
            : (getThreadData?.hasUnread ?? false);

        let labels: { id: string; name: string }[] = [];
        if (getThreadData?.labels) {
          labels = [...getThreadData.labels];
          const hasStarredLabel = labels.some((label) => label.name === 'STARRED');

          if (optimisticState.optimisticStarred !== null) {
            if (optimisticState.optimisticStarred && !hasStarredLabel) {
              labels.push({ id: 'starred-optimistic', name: 'STARRED' });
            } else if (!optimisticState.optimisticStarred && hasStarredLabel) {
              labels = labels.filter((label) => label.name !== 'STARRED');
            }
          }

          if (optimisticState.optimisticLabels) {
            labels = labels.filter(
              (label) => !optimisticState.optimisticLabels.removedLabelIds.includes(label.id),
            );

            optimisticState.optimisticLabels.addedLabelIds.forEach((labelId) => {
              if (!labels.some((label) => label.id === labelId)) {
                labels.push({ id: labelId, name: labelId });
              }
            });
          }
        }

        return {
          displayStarred,
          displayImportant,
          displayUnread,
          optimisticLabels: labels,
          emailContent,
        };
      }, [
        optimisticState.optimisticStarred,
        optimisticState.optimisticImportant,
        optimisticState.optimisticRead,
        getThreadData?.latest?.tags,
        getThreadData?.hasUnread,
        getThreadData?.labels,
        optimisticState.optimisticLabels,
      ]);

    const { optimisticToggleStar, optimisticToggleImportant, optimisticMoveThreadsTo } =
      useOptimisticActions();

    const handleToggleStar = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!getThreadData || !idToUse) return;

        const newStarredState = !displayStarred;
        optimisticToggleStar([idToUse], newStarredState);
      },
      [getThreadData, idToUse, displayStarred, optimisticToggleStar],
    );

    const handleToggleImportant = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!getThreadData || !idToUse) return;

        const newImportantState = !displayImportant;
        optimisticToggleImportant([idToUse], newImportantState);
      },
      [getThreadData, idToUse, displayImportant, optimisticToggleImportant],
    );

    const handleNext = useCallback(
      (id: string) => {
        if (!id || !threads.length || focusedIndex === null) return setThreadId(null);
        if (focusedIndex < threads.length - 1) {
          const nextThread = threads[focusedIndex];
          if (nextThread) {
            setThreadId(nextThread.id);
            // Don't clear activeReplyId - let ThreadDisplay handle Reply All auto-opening
            setFocusedIndex(focusedIndex);
          }
        }
      },
      [threads, id, focusedIndex],
    );

    const moveThreadTo = useCallback(
      async (destination: ThreadDestination) => {
        if (!idToUse) return;
        handleNext(idToUse);
        optimisticMoveThreadsTo([idToUse], folder ?? '', destination);
      },
      [idToUse, folder, optimisticMoveThreadsTo, handleNext],
    );

    const { labels: threadLabels } = useThreadLabels(
      optimisticLabels ? optimisticLabels.map((l) => l.id) : [],
    );

    const [mailState, setMail] = useMail();
    const { isMailSelected, isMailBulkSelected } = useMemo(() => {
      const isSelected =
        !threadId || !idToUse ? false : idToUse === threadId || threadId === mailState.selected;
      const isBulkSelected = idToUse ? mailState.bulkSelected.includes(idToUse) : false;

      return { isMailSelected: isSelected, isMailBulkSelected: isBulkSelected };
    }, [threadId, idToUse, mailState.selected, mailState.bulkSelected]);

    const { isFolderInbox, isFolderSpam, isFolderSent, isFolderBin } = useMemo(
      () => ({
        isFolderInbox: folder === FOLDERS.INBOX || !folder,
        isFolderSpam: folder === FOLDERS.SPAM,
        isFolderSent: folder === FOLDERS.SENT,
        isFolderBin: folder === FOLDERS.BIN,
      }),
      [folder],
    );

    // Check if thread has a draft
    const hasDraft = useMemo(() => {
      return !!latestDraft;
    }, [latestDraft]);

    const content = useMemo(() => {
      if (!latestMessage || !getThreadData) return null;

      return (
        <div
          className={cn('select-none border-b md:my-1 md:border-none')}
          onClick={onClick ? onClick(latestMessage) : undefined}
          onMouseEnter={() => {
            window.dispatchEvent(new CustomEvent('emailHover', { detail: { id: idToUse } }));
          }}
          onMouseLeave={() => {
            window.dispatchEvent(new CustomEvent('emailHover', { detail: { id: null } }));
          }}
        >
          <div
            data-thread-id={idToUse}
            key={idToUse}
            className={cn(
              'hover:bg-offsetLight hover:bg-primary/5 group relative mx-1 flex cursor-pointer flex-col items-start rounded-lg py-2 text-left text-sm transition-all hover:opacity-100',
              (isMailSelected || isMailBulkSelected || isKeyboardFocused) &&
                'border-border bg-primary/5 opacity-100',
              isKeyboardFocused && 'ring-primary/50',
              'relative',
              'group',
            )}
          >
            <div
              className={cn(
                'dark:bg-panelDark absolute right-2 z-[25] flex -translate-y-1/2 items-center gap-1 rounded-xl border bg-white p-1 opacity-0 shadow-sm group-hover:opacity-100',
                index === 0 ? 'top-4' : 'top-[-1]',
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 overflow-visible [&_svg]:size-3.5"
                    onClick={handleToggleStar}
                  >
                    <Star2
                      className={cn(
                        'h-4 w-4',
                        displayStarred
                          ? 'fill-yellow-400 stroke-yellow-400'
                          : 'fill-transparent stroke-[#9D9D9D] dark:stroke-[#9D9D9D]',
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side={index === 0 ? 'bottom' : 'top'}
                  className="mb-1 bg-white dark:bg-[#1A1A1A]"
                >
                  {displayStarred
                    ? m['common.threadDisplay.unstar']()
                    : m['common.threadDisplay.star']()}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-6 w-6 [&_svg]:size-3.5',
                      displayImportant ? 'hover:bg-orange-200/70 dark:hover:bg-orange-800/40' : '',
                    )}
                    onClick={handleToggleImportant}
                  >
                    <ExclamationCircle
                      className={cn(displayImportant ? 'fill-orange-400' : 'fill-[#9D9D9D]')}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side={index === 0 ? 'bottom' : 'top'}
                  className="dark:bg-panelDark mb-1 bg-white"
                >
                  {m['common.mail.toggleImportant']()}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 [&_svg]:size-3.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveThreadTo('archive');
                    }}
                  >
                    <Archive2 className="fill-[#9D9D9D]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side={index === 0 ? 'bottom' : 'top'}
                  className="dark:bg-panelDark mb-1 bg-white"
                >
                  {m['common.threadDisplay.archive']()}
                </TooltipContent>
              </Tooltip>
              {!isFolderBin ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-[#FDE4E9] dark:hover:bg-[#411D23] [&_svg]:size-3.5"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        moveThreadTo('bin');
                      }}
                    >
                      <Trash className="fill-[#F43F5E]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side={index === 0 ? 'bottom' : 'top'}
                    className="dark:bg-panelDark mb-1 bg-white"
                  >
                    {m['common.actions.Bin']()}
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>

            <div
              className={`relative flex w-full items-center justify-between gap-4 px-4 ${displayUnread ? '' : 'opacity-60'}`}
            >
              <div>
                {isMailBulkSelected ? (
                  <Avatar
                    className={cn(
                      'h-8 w-8 rounded-full',
                      displayUnread && !isMailSelected && !isFolderSent ? '' : 'border',
                    )}
                  >
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full bg-[#006FFE] p-2 dark:bg-[#006FFE]"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setMail((prev: Config) => ({
                          ...prev,
                          bulkSelected: prev.bulkSelected.filter((id: string) => id !== idToUse),
                        }));
                      }}
                    >
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </Avatar>
                ) : isGroupThread ? (
                  <Avatar
                    className={cn(
                      'h-8 w-8 rounded-full',
                      displayUnread && !isMailSelected && !isFolderSent ? '' : 'border',
                    )}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#FFFFFF] p-2 dark:bg-[#373737]">
                      <GroupPeople className="h-4 w-4" />
                    </div>
                  </Avatar>
                ) : (
                  <BimiAvatar
                    email={latestMessage.sender.email}
                    name={cleanName || latestMessage.sender.email}
                    className={cn(
                      'h-8 w-8 rounded-full',
                      displayUnread && !isMailSelected && !isFolderSent ? '' : 'border',
                    )}
                  />
                )}
                {/* {displayUnread && !isMailSelected && !isFolderSent ? (
                  <>
                    <span className="absolute left-2 top-2 size-1.5 rounded bg-[#006FFE]" />
                    <span className="absolute left-[11px] top-4 size-1 rounded bg-[#006FFE]" />
                  </>
                ) : null} */}
              </div>

              <div className="flex w-full justify-between">
                <div className="w-full">
                  <div className="flex w-full flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-[4px]">
                      <span
                        className={cn(
                          displayUnread && !isMailSelected ? 'font-bold' : 'font-medium',
                          'text-md flex items-baseline gap-1 group-hover:opacity-100',
                        )}
                      >
                        {isFolderSent ? (
                          <span
                            className={cn(
                              'overflow-hidden truncate text-sm md:max-w-[15ch] xl:max-w-[25ch]',
                            )}
                          >
                            {highlightText(latestMessage.subject, searchValue.highlight)}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className={cn('line-clamp-1 overflow-hidden text-sm')}>
                              {highlightText(
                                cleanNameDisplay(latestMessage.sender.name) || '',
                                searchValue.highlight,
                              )}
                            </span>
                            {displayUnread && !isMailSelected && !isFolderSent ? (
                              <>
                                <span className="ml-0.5 size-2 rounded-full bg-[#006FFE]" />
                              </>
                            ) : null}
                          </div>
                        )}{' '}
                        {/* {!isFolderSent ? (
                          <span className="hidden items-center space-x-2 md:flex">
                            <RenderLabels labels={threadLabels} />
                          </span>
                        ) : null} */}
                      </span>
                      {getThreadData.totalReplies > 1 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="rounded-md text-xs opacity-70">
                              [{getThreadData.totalReplies}]
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="p-1 text-xs">
                            {m['common.mail.replies']({ count: getThreadData.totalReplies })}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                      {hasDraft ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center">
                              <PencilCompose className="h-3 w-3 fill-blue-500 dark:fill-blue-400" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="p-1 text-xs">Draft</TooltipContent>
                        </Tooltip>
                      ) : null}
                      {/* {hasNotes ? (
                        <span className="inline-flex items-center">
                          <StickyNote className="h-3 w-3 fill-amber-500 stroke-amber-500 dark:fill-amber-400 dark:stroke-amber-400" />
                        </span>
                      ) : null} */}
                      <MailLabels labels={optimisticLabels} />
                    </div>
                    {latestMessage.receivedOn ? (
                      <p
                        className={cn(
                          'text-muted-foreground text-nowrap text-xs font-normal opacity-70 transition-opacity group-hover:opacity-100 dark:text-[#8C8C8C]',
                          isMailSelected && 'opacity-100',
                        )}
                      >
                        {formatDate(latestMessage.receivedOn.split('.')[0] || '')}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-between">
                    {isFolderSent ? (
                      <p
                        className={cn(
                          'mt-1 line-clamp-1 max-w-[50ch] overflow-hidden text-sm text-[#8C8C8C] md:max-w-[25ch]',
                        )}
                      >
                        {latestMessage.to.map((e) => e.email).join(', ')}
                      </p>
                    ) : (
                      <p
                        className={cn(
                          'mt-1 line-clamp-1 w-[95%] min-w-0 overflow-hidden text-sm text-[#8C8C8C]',
                        )}
                      >
                        {highlightText(latestMessage.subject, searchValue.highlight)}
                      </p>
                    )}
                    {/* <div className="hidden md:flex">
                      {getThreadData.labels ? <MailLabels labels={getThreadData.labels} /> : null}
                    </div> */}
                    {threadLabels && (
                      <div className="mr-0 flex w-fit items-center justify-end gap-1">
                        {!isFolderSent ? <RenderLabels labels={threadLabels} /> : null}
                        {/* {getThreadData.labels ? <MailLabels labels={getThreadData.labels} /> : null} */}
                      </div>
                    )}
                  </div>
                  {emailContent && (
                    <div className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                      {highlightText(emailContent, searchValue.highlight)}
                    </div>
                  )}
                  {/* {mainSearchTerm && (
                    <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5">
                        {mainSearchTerm}
                      </span>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }, [
      latestMessage,
      getThreadData,
      optimisticState,
      idToUse,
      folder,
      isFolderBin,
      isFolderSent,
      isFolderSpam,
      isFolderInbox,
      onClick,
      searchValue,
      displayUnread,
      isMailSelected,
      isMailBulkSelected,
      threadLabels,
      optimisticLabels,
      emailContent,
    ]);

    return latestMessage ? (
      !optimisticState.shouldHide && idToUse ? (
        <ThreadContextMenu
          threadId={idToUse}
          isInbox={isFolderInbox}
          isSpam={isFolderSpam}
          isSent={isFolderSent}
          isBin={isFolderBin}
        >
          {content}
        </ThreadContextMenu>
      ) : null
    ) : null;
  },
  (prev, next) => {
    const isSameMessage =
      prev.message.id === next.message.id &&
      prev.isKeyboardFocused === next.isKeyboardFocused &&
      prev.index === next.index &&
      Object.is(prev.onClick, next.onClick);
    return isSameMessage;
  },
);

const Draft = memo(({ message }: { message: { id: string } }) => {
  const draftQuery = useDraft(message.id) as UseQueryResult<ParsedDraft>;
  const draft = draftQuery.data;
  const [, setComposeOpen] = useQueryState('isComposeOpen');
  const [, setDraftId] = useQueryState('draftId');
  const handleMailClick = useCallback(() => {
    setComposeOpen('true');
    setDraftId(message.id);
    return;
  }, [message.id]);

  if (!draft) {
    return (
      <div className="select-none py-1">
        <div
          key={message.id}
          className={cn(
            'group relative mx-[8px] flex cursor-pointer flex-col items-start overflow-clip rounded-[10px] border-transparent py-3 text-left text-sm transition-all',
          )}
        >
          <div
            className={cn(
              'bg-primary absolute inset-y-0 left-0 w-1 -translate-x-2 transition-transform ease-out',
            )}
          />
          <div className="flex w-full items-center justify-between gap-4 px-4">
            <div className="flex w-full justify-between">
              <div className="w-full">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row items-center gap-[4px]">
                    <Skeleton className="bg-muted h-4 w-32 rounded" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Skeleton className="bg-muted mt-1 h-4 w-48 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="select-none py-1" onClick={handleMailClick}>
      <div
        key={message.id}
        className={cn(
          'hover:bg-offsetLight hover:bg-primary/5 group relative mx-[8px] flex cursor-pointer flex-col items-start overflow-clip rounded-[10px] border-transparent py-3 text-left text-sm transition-all hover:opacity-100',
        )}
      >
        <div
          className={cn(
            'bg-primary absolute inset-y-0 left-0 w-1 -translate-x-2 transition-transform ease-out',
          )}
        />
        <div className="flex w-full items-center justify-between gap-4 px-4">
          <div className="flex w-full justify-between">
            <div className="w-full">
              <div className="flex w-full flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-[4px]">
                  <span
                    className={cn(
                      'font-medium',
                      'text-md flex items-baseline gap-1 group-hover:opacity-100',
                    )}
                  >
                    <span className={cn('max-w-[25ch] truncate text-sm')}>
                      {cleanNameDisplay(draft?.to?.[0] || 'No Recipient') || ''}
                    </span>
                  </span>
                </div>
                {draft.rawMessage?.internalDate && (
                  <p
                    className={cn(
                      'text-muted-foreground text-nowrap text-xs font-normal opacity-70 transition-opacity group-hover:opacity-100 dark:text-[#8C8C8C]',
                    )}
                  >
                    {formatDate(Number(draft.rawMessage?.internalDate))}
                  </p>
                )}
              </div>
              <div className="flex justify-between">
                <p
                  className={cn(
                    'mt-1 line-clamp-1 max-w-[50ch] text-sm text-[#8C8C8C] md:max-w-[30ch]',
                  )}
                >
                  {draft?.subject}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const MailList = memo(
  function MailList() {
    const { folder } = useParams<{ folder: string }>();
    const { data: settingsData } = useSettings();
    const [, setThreadId] = useQueryState('threadId');
    const [, setDraftId] = useQueryState('draftId');
    const [category, setCategory] = useQueryState('category');
    const [searchValue, setSearchValue] = useSearchValue();
    const [{ refetch, isLoading, isFetching, isFetchingNextPage, hasNextPage }, items, , loadMore] =
      useThreads();
    const trpc = useTRPC();
    const isFetchingMail = useIsFetching({ queryKey: trpc.mail.get.queryKey() }) > 0;
    const itemsRef = useRef(items);
    const parentRef = useRef<HTMLDivElement>(null);
    const vListRef = useRef<VListHandle>(null);

    useEffect(() => {
      itemsRef.current = items;
    }, [items]);

    const allCategories = Categories();

    // Skip category filtering for drafts, spam, sent, archive, and bin pages
    const shouldFilter = !['draft', 'spam', 'sent', 'archive', 'bin'].includes(folder || '');

    // Set initial category search value only if not in special folders
    useEffect(() => {
      if (!shouldFilter) return;

      const currentCategory = category
        ? allCategories.find((cat) => cat.id === category)
        : allCategories.find((cat) => cat.id === 'All Mail');

      if (currentCategory && searchValue.value === '') {
        setSearchValue({
          value: currentCategory.searchValue || '',
          highlight: '',
          folder: '',
        });
      }
    }, [allCategories, category, shouldFilter, searchValue.value, setSearchValue]);

    // Add event listener for refresh
    useEffect(() => {
      const handleRefresh = () => {
        void refetch();
      };

      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('refreshMailList', handleRefresh);
        return () => {
          try {
            window.removeEventListener('refreshMailList', handleRefresh);
          } catch (error) {
            console.error('Error removing refreshMailList listener:', error);
          }
        };
      }
      return undefined;
    }, [refetch]);

    const handleNavigateToThread = useCallback(
      (threadId: string | null) => {
        setThreadId(threadId);
        return;
      },
      [setThreadId],
    );

    const { focusedIndex, handleMouseEnter, keyboardActive } = useMailNavigation({
      items,
      containerRef: parentRef,
      onNavigate: handleNavigateToThread,
    });

    const isKeyPressed = useKeyState();

    const getSelectMode = useCallback((): MailSelectMode => {
      const isAltPressed =
        isKeyPressed('Alt') || isKeyPressed('AltLeft') || isKeyPressed('AltRight');

      const isShiftPressed =
        isKeyPressed('Shift') || isKeyPressed('ShiftLeft') || isKeyPressed('ShiftRight');

      if (isKeyPressed('Control') || isKeyPressed('Meta')) {
        return 'mass';
      }

      if (isAltPressed && isShiftPressed) {
        console.log('Select All Below mode activated'); // Debug log
        return 'selectAllBelow';
      }

      if (isShiftPressed) {
        return 'range';
      }

      return 'single';
    }, [isKeyPressed]);

    const [, setActiveReplyId] = useQueryState('activeReplyId');
    const [, setMail] = useMail();

    const handleSelectMail = useCallback(
      (message: ParsedMessage) => {
        const itemId = message.threadId ?? message.id;
        const currentMode = getSelectMode();
        console.log('Selection mode:', currentMode, 'for item:', itemId);

        setMail((prevMail) => {
          const mail = prevMail;
          switch (currentMode) {
            case 'mass': {
              const newSelected = mail.bulkSelected.includes(itemId)
                ? mail.bulkSelected.filter((id) => id !== itemId)
                : [...mail.bulkSelected, itemId];
              console.log('Mass selection mode - selected items:', newSelected.length);
              return { ...mail, bulkSelected: newSelected };
            }
            case 'selectAllBelow': {
              const clickedIndex = itemsRef.current.findIndex((item) => item.id === itemId);
              console.log(
                'SelectAllBelow - clicked index:',
                clickedIndex,
                'total items:',
                itemsRef.current.length,
              );

              if (clickedIndex !== -1) {
                const itemsBelow = itemsRef.current.slice(clickedIndex);
                const idsBelow = itemsBelow.map((item) => item.id);
                console.log('Selecting all items below - count:', idsBelow.length);
                return { ...mail, bulkSelected: idsBelow };
              }
              console.log('Item not found in list, selecting just this item');
              return { ...mail, bulkSelected: [itemId] };
            }
            case 'range': {
              console.log('Range selection mode - not fully implemented');
              return { ...mail, bulkSelected: [itemId] };
            }
            default: {
              console.log('Single selection mode');
              return { ...mail, bulkSelected: [itemId] };
            }
          }
        });
      },
      [getSelectMode, setMail],
    );

    const [, setFocusedIndex] = useAtom(focusedIndexAtom);

    const { optimisticMarkAsRead } = useOptimisticActions();
    const handleMailClick = useCallback(
      (message: ParsedMessage) => async () => {
        const mode = getSelectMode();
        const autoRead = settingsData?.settings?.autoRead ?? true;
        console.log('Mail click with mode:', mode);

        if (mode !== 'single') {
          return handleSelectMail(message);
        }

        handleMouseEnter(message.id);

        const messageThreadId = message.threadId ?? message.id;
        const clickedIndex = itemsRef.current.findIndex((item) => item.id === messageThreadId);
        setFocusedIndex(clickedIndex);
        if (message.unread && autoRead) optimisticMarkAsRead([messageThreadId], true);
        setThreadId(messageThreadId);
        setDraftId(null);
        // Don't clear activeReplyId - let ThreadDisplay handle Reply All auto-opening
      },
      [
        getSelectMode,
        handleSelectMail,
        handleMouseEnter,
        setFocusedIndex,
        optimisticMarkAsRead,
        setThreadId,
        setDraftId,
        settingsData,
        setActiveReplyId,
      ],
    );

    const isFiltering = searchValue.value.trim().length > 0;

    useEffect(() => {
      if (isFiltering && !isLoading) {
        setSearchValue({
          ...searchValue,
          isLoading: false,
        });
      }
    }, [isLoading, isFiltering, setSearchValue]);

    const clearFilters = () => {
      setCategory(null);
      setSearchValue({
        value: '',
        highlight: '',
        folder: '',
      });
    };

    const filteredItems = useMemo(() => items.filter((item) => item.id), [items]);

    const Comp = useMemo(() => (folder === FOLDERS.DRAFT ? Draft : Thread), [folder]);

    const vListRenderer = useCallback(
      (index: number) => {
        const item = filteredItems[index];
        return item ? (
          <>
            <Comp
              key={item.id}
              message={item}
              isKeyboardFocused={focusedIndex === index && keyboardActive}
              index={index}
              onClick={handleMailClick}
            />
            {index === filteredItems.length - 1 && (isFetchingNextPage || isFetchingMail) ? (
              <div className="flex w-full justify-center py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
              </div>
            ) : null}
          </>
        ) : (
          <></>
        );
      },
      [
        folder,
        filteredItems,
        focusedIndex,
        keyboardActive,
        isFetchingMail,
        isFetchingNextPage,
        handleMailClick,
        isLoading,
        isFetching,
        hasNextPage,
      ],
    );

    return (
      <>
        <div
          ref={parentRef}
          className={cn(
            'hide-link-indicator flex h-full w-full',
            getSelectMode() === 'range' && 'select-none',
          )}
        >
          <>
            {isLoading ? (
              <div className="flex h-32 w-full items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
              </div>
            ) : !items || items.length === 0 ? (
              <div className="flex w-full items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <EmptyStateIcon width={200} height={200} />
                  <div className="mt-5">
                    <p className="text-lg">It's empty here</p>
                    <p className="text-md text-muted-foreground dark:text-white/50">
                      Search for another email or{' '}
                      <button className="underline" onClick={clearFilters}>
                        clear filters
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col" id="mail-list-scroll">
                <VList
                  ref={vListRef}
                  count={filteredItems.length}
                  overscan={5}
                  itemSize={100}
                  className="scrollbar-none flex-1 overflow-x-hidden"
                  onScroll={() => {
                    if (!vListRef.current) return;
                    const endIndex = vListRef.current.findEndIndex();
                    if (
                      // if the shown items are last 5 items, load more
                      Math.abs(filteredItems.length - 1 - endIndex) < 7 &&
                      !isLoading &&
                      !isFetchingNextPage &&
                      !isFetchingMail &&
                      hasNextPage
                    ) {
                      void loadMore();
                    }
                  }}
                >
                  {vListRenderer}
                </VList>
              </div>
            )}
          </>
        </div>
        <div className="w-full pt-2 text-center">
          {isFetching ? (
            <div className="text-center">
              <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
            </div>
          ) : (
            <div className="h-2" />
          )}
        </div>
      </>
    );
  },
  () => true,
);

export const MailLabels = memo(
  function MailListLabels({ labels }: { labels: { id: string; name: string }[] }) {
    if (!labels?.length) return null;

    const visibleLabels = labels.filter(
      (label) => !['unread', 'inbox'].includes(label.name.toLowerCase()),
    );

    if (!visibleLabels.length) return null;

    return (
      <div className={cn('flex select-none items-center')}>
        {visibleLabels.map((label) => {
          const style = getDefaultBadgeStyle(label.name);
          if (label.name.toLowerCase() === 'notes') {
            return (
              <Tooltip key={label.id}>
                <TooltipTrigger asChild>
                  <Badge className="rounded-md bg-amber-100 p-1 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                    {getLabelIcon(label.name)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="hidden px-1 py-0 text-xs">
                  {m['common.notes.title']()}
                </TooltipContent>
              </Tooltip>
            );
          }

          // Skip rendering if style is "secondary" (default case)
          if (style === 'secondary') return null;
          const content = getLabelIcon(label.name);

          return content ? (
            <Badge key={label.id} className="rounded-md p-1" variant={style}>
              {content}
            </Badge>
          ) : null;
        })}
      </div>
    );
  },
  (prev, next) => {
    return JSON.stringify(prev.labels) === JSON.stringify(next.labels);
  },
);

function getLabelIcon(label: string) {
  const normalizedLabel = label.toLowerCase().replace(/^category_/i, '');

  switch (normalizedLabel) {
    case 'starred':
      return <Star className="h-[12px] w-[12px] fill-yellow-400 stroke-yellow-400" />;
    default:
      return null;
  }
}

function getDefaultBadgeStyle(label: string): ComponentProps<typeof Badge>['variant'] {
  const normalizedLabel = label.toLowerCase().replace(/^category_/i, '');

  switch (normalizedLabel) {
    case 'starred':
    case 'important':
      return 'important';
    case 'promotions':
      return 'promotions';
    case 'personal':
      return 'personal';
    case 'updates':
      return 'updates';
    case 'work':
      return 'default';
    case 'forums':
      return 'forums';
    case 'notes':
      return 'secondary';
    default:
      return 'secondary';
  }
}

// Helper function to clean name display
const cleanNameDisplay = (name?: string) => {
  if (!name) return '';
  const match = name.match(/^[^\p{L}\p{N}.]*(.*?)[^\p{L}\p{N}.]*$/u);
  return match ? match[1] : name;
};
