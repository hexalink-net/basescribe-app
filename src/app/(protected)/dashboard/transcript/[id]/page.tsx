import { createClient, getUserUploadSSR } from '@/lib/supabase/server';
import TranscriptClient from './TranscriptClient';
import { redirect } from 'next/navigation';
import { BucketNameUpload } from '@/constants/SupabaseBucket';

type tParams = Promise<{ id: string }>;

export default async function TranscriptPage({ params }: { params: tParams }) {
  // Ensure params is properly awaited
  const { id } = await params;
  
  // Get server-side Supabase client
  const supabase = await createClient();
  
  // Get the user session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }
  
  // Get the upload details using server-side function
  const { data: upload } = await getUserUploadSSR(supabase, user.id, id);
  
  if (!upload) {
    return <TranscriptClient upload={null} audioUrl={''} />;
  }
  
  // Generate the public URL for the audio file on the server
  let audioUrl = '';
  if (upload.file_path) {
    const { data, error } = await supabase.storage
      .from(BucketNameUpload)
      .createSignedUrl(upload.file_path, 3600); // 1 hour expiry;

    if (!error && data?.signedUrl) {
      audioUrl = data.signedUrl;
    } else {
      console.error('Failed to create signed URL');
    }
  }

  // Return the client component with the data
  return <TranscriptClient upload={upload} audioUrl={audioUrl} />;
}
