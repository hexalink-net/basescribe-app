import { createClient, getUserUploadSSR } from '@/lib/supabase/server';
import TranscriptClient from './TranscriptClient';
import { redirect } from 'next/navigation';
import { bucketNameUpload } from '@/constants/SupabaseBucket';

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
  const { data: upload, error } = await getUserUploadSSR(supabase, user.id, id);
  
  if (error) {
    console.error('Error fetching upload:', error);
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
  
  if (!upload) {
    console.error('Transcript not found');
    throw new Error('Transcript not found. It may have been deleted or you may not have permission to view it.');
  }
  
  // Generate the public URL for the audio file on the server
  let audioUrl = '';
  if (upload.file_path) {
    const { data, error } = await supabase.storage
      .from(bucketNameUpload)
      .createSignedUrl(upload.file_path, 3600); // 1 hour expiry;

    if (error) {
      console.error('Error creating signed URL:', error);
      throw new Error(`Failed to generate audio URL: ${error.message}`);
    }

    audioUrl = data.signedUrl;
  }

  // Return the client component with the data
  return <TranscriptClient upload={upload} audioUrl={audioUrl} />;
}
