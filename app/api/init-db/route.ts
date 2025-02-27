import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export async function GET() {
  try {
    // Check if tables exist
    const { data: tablesCheck, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['proposals', 'votes']);

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error checking if tables exist',
        details: tablesError
      }, { status: 500 });
    }

    // If tables don't exist, create them
    if (!tablesCheck || tablesCheck.length < 2) {
      // Create the proposals table
      const createProposalsTable = await supabase.rpc('create_proposals_table');
      if (createProposalsTable.error) {
        console.error('Error creating proposals table:', createProposalsTable.error);
        return NextResponse.json({ 
          success: false, 
          error: 'Error creating proposals table',
          details: createProposalsTable.error
        }, { status: 500 });
      }

      // Create the votes table
      const createVotesTable = await supabase.rpc('create_votes_table');
      if (createVotesTable.error) {
        console.error('Error creating votes table:', createVotesTable.error);
        return NextResponse.json({ 
          success: false, 
          error: 'Error creating votes table',
          details: createVotesTable.error
        }, { status: 500 });
      }

      // Create the view
      const createView = await supabase.rpc('create_proposal_votes_view');
      if (createView.error) {
        console.error('Error creating view:', createView.error);
        return NextResponse.json({ 
          success: false, 
          error: 'Error creating view',
          details: createView.error
        }, { status: 500 });
      }

      // Import existing data from Zustand if any
      try {
        const existingReviews = useStore.getState().reviews;
        
        for (const review of existingReviews) {
          // Insert the proposal
          const { data: proposal, error: proposalError } = await supabase
            .from('proposals')
            .insert([{
              id: review.id,
              author: review.author,
              title: review.title
            }])
            .select();

          if (proposalError) {
            console.error('Error importing proposal:', proposalError);
            continue;
          }

          // Import votes
          if (review.votedBy && review.votedBy.length > 0) {
            const voteInserts = review.votedBy.map(wallet => ({
              proposal_id: review.id,
              wallet_address: wallet
            }));

            const { error: votesError } = await supabase
              .from('votes')
              .insert(voteInserts);

            if (votesError) {
              console.error('Error importing votes:', votesError);
            }
          }
        }
      } catch (error) {
        console.error('Error importing data from Zustand:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully'
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
