import { redirect } from 'react-router-dom';

export default function MailPage() {
  // Redirect to inbox by default
  redirect('/mail/inbox');
  return null;
}
