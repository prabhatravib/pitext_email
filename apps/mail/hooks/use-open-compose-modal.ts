import { useQueryState } from '@/lib/nuqs-replacement';

export const useOpenComposeModal = () => {
  const [isOpen, setIsOpen] = useQueryState('open-compose');

  const open = () => setIsOpen('true');
  const close = () => setIsOpen(null);

  return {
    open,
    close,
    isOpen: isOpen === 'true',
    setIsOpen: (value: boolean) => setIsOpen(value ? 'true' : null),
  };
};
