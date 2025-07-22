import { redirect } from 'react-router-dom';

export default function CreatePage() {
  // Redirect to inbox with compose parameters
  redirect('/mail/inbox?isComposeOpen=true');
  return null;
}

// export async function generateMetadata({ searchParams }: any) {
//   // Need to await searchParams in Next.js 15+
//   const params = await searchParams;

//   const toParam = params.to || 'someone';

//   // Create common metadata properties
//   const title = `Email ${toParam} on Zero`;
//   const description = 'Zero - The future of email is here';
//   const imageUrl = `/og-api/create?to=${encodeURIComponent(toParam)}${params.subject ? `&subject=${encodeURIComponent(params.subject)}` : ''}`;

//   // Create metadata object
//   return {
//     title,
//     description,
//     openGraph: {
//       title,
//       description,
//       images: [imageUrl],
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title,
//       description,
//       images: [imageUrl],
//     },
//   };
// }
