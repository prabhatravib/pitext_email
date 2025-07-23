import {
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Filter,
  Hash,
  Info,
  Loader2,
  Mail,
  Paperclip,
  Search,
  Star,
  Tag,
  Trash2,
  User,
  Users,
  X as XIcon,
} from 'lucide-react';
import {
  createContext,
  Fragment,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getMainSearchTerm, parseNaturalLanguageSearch } from '@/lib/utils';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useSearchValue } from '@/hooks/use-search-value';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationConfig } from '@/config/navigation';
import { Separator } from '@/components/ui/separator';
import { useTRPC } from '@/providers/query-provider';
import { Calendar } from '@/components/ui/calendar';
import { useMutation } from '@tanstack/react-query';
import { useThreads } from '@/hooks/use-threads';
import { useLabels } from '@/hooks/use-labels';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';
import { VisuallyHidden } from 'radix-ui';
import { m } from '@/src/paraglide/messages';
import { Pencil2 } from '../icons/icons';
import { Button } from '../ui/button';
import { useQueryState } from '@/lib/nuqs-replacement';
import { toast } from 'sonner';

type CommandPaletteContext = {
  activeFilters: ActiveFilter[];
  clearAllFilters: () => void;
};

interface CommandItem {
  title: string;
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  url?: string;
  onClick?: () => unknown;
  shortcut?: string;
  isBackButton?: boolean;
  disabled?: boolean;
  keywords?: string[];
  description?: string;
}

interface FilterOption {
  id: string;
  name: string;
  keywords: string[];
  action: (...args: string[]) => string;
  requiresInput?: boolean;
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  createdAt: Date;
}

interface ActiveFilter {
  id: string;
  type: string;
  value: string;
  display: string;
}

type CommandView =
  | 'main'
  | 'search'
  | 'filter'
  | 'dateRange'
  | 'labels'
  | 'savedSearches'
  | 'filterBuilder'
  | 'help';

const CommandPaletteContext = createContext<CommandPaletteContext | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    // Provide a fallback context instead of throwing an error
    console.warn('useCommandPalette used outside CommandPaletteProvider, using fallback context');
    return {
      activeFilters: [],
      clearAllFilters: () => {
        console.warn('clearAllFilters called outside CommandPaletteProvider');
      },
    };
  }
  return context;
}

const RECENT_SEARCHES_KEY = 'mail-recent-searches';
const SAVED_SEARCHES_KEY = 'mail-saved-searches';
const ACTIVE_FILTERS_KEY = 'mail-active-filters';

const getRecentSearches = (): string[] => {
  try {
    const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (search: string) => {
  try {
    const searches = getRecentSearches();
    const updated = [search, ...searches.filter((s) => s !== search)].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
};

const getSavedSearches = (): SavedSearch[] => {
  try {
    const searches = localStorage.getItem(SAVED_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
  } catch {
    return [];
  }
};

const saveSavedSearch = (search: SavedSearch) => {
  try {
    const searches = getSavedSearches();
    const updated = [search, ...searches];
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save search:', error);
  }
};

const deleteSavedSearch = (id: string) => {
  try {
    const searches = getSavedSearches();
    const updated = searches.filter((s) => s.id !== id);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete saved search:', error);
  }
};

export function CommandPalette({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useQueryState('isCommandPaletteOpen');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Simple keyboard handler for opening command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prevOpen) => (prevOpen ? null : 'true'));
      }
    };

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', down, { capture: true });
      return () => {
        try {
          document.removeEventListener('keydown', down, { capture: true });
        } catch (error) {
          console.error('Error removing command palette keydown listener:', error);
        }
      };
    }
    return undefined;
  }, [setOpen]);

  return (
    <CommandPaletteContext.Provider
      value={{
        activeFilters,
        clearAllFilters,
      }}
    >
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  return <CommandPalette>{children}</CommandPalette>;
}
