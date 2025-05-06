import { createClient } from '@/lib/supabase/server';
import TranscriptClient from './TranscriptClient';
import { redirect } from 'next/navigation';
import { fetchTranscriptData } from '../actions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

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
  
  // Fetch transcript data using server action
  const { upload, audioUrl, error } = await fetchTranscriptData(id);
  
  // Handle any errors
  if (error) {
    console.error('Error loading transcript:', error);
  }
  
  if (!upload) {
    return <TranscriptClient 
      upload={null} 
      audioUrl={''} 
    />;
  }

  // Return the client component with the data
  return(
    <div className="flex flex-col h-screen bg-[#171717]">
      <DashboardHeader user={user} layout='transcript' showFeedbackButton={false} />
      <div className="max-w-340 mx-auto w-full px-6 md:px-8">
        <TranscriptClient 
          upload={upload} 
          audioUrl={audioUrl} 
        />
      </div>
    </div>
  );
}
