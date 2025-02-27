import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProposalType = {
  id: number;
  author: string;
  title: string;
  created_at: string;
};

export type VoteType = {
  id: number;
  proposal_id: number;
  wallet_address: string;
  created_at: string;
};

// SQL for creating tables in Supabase:
/*
CREATE TABLE proposals (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL REFERENCES proposals(id),
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now()),
  UNIQUE(proposal_id, wallet_address)
);

CREATE VIEW proposal_votes AS
SELECT 
  p.id,
  p.author,
  p.title,
  p.created_at,
  COUNT(v.id) AS votes,
  array_agg(v.wallet_address) FILTER (WHERE v.wallet_address IS NOT NULL) AS voted_by
FROM proposals p
LEFT JOIN votes v ON p.id = v.proposal_id
GROUP BY p.id, p.author, p.title, p.created_at;
*/
