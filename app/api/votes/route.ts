import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { proposal_id, wallet_address } = body;

    if (!proposal_id || !wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has already voted for any proposal
    const { data: existingVotes, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('wallet_address', wallet_address);

    if (checkError) throw checkError;

    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User has already voted' },
        { status: 400 }
      );
    }

    // Add the vote
    const { data, error } = await supabase
      .from('votes')
      .insert([{ proposal_id, wallet_address }])
      .select();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'You have already voted for this proposal' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error adding vote:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
