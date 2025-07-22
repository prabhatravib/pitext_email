import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateEmail } from '@/components/create/create-email';
import { useSearchParams } from 'react-router';

export default function ComposePage() {
  const [searchParams] = useSearchParams();
  
  const params = {
    to: searchParams.get('to') || '',
    subject: searchParams.get('subject') || '',
    body: searchParams.get('body') || '',
    draftId: searchParams.get('draftId') || '',
    cc: searchParams.get('cc') || '',
    bcc: searchParams.get('bcc') || '',
  };

  return (
    <Dialog open={true}>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-4xl">
        <DialogDescription></DialogDescription>
        <CreateEmail
          initialTo={params.to}
          initialSubject={params.subject}
          initialBody={params.body}
          initialCc={params.cc}
          initialBcc={params.bcc}
          draftId={params.draftId || undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
