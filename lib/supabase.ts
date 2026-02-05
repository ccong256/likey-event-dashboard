import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface Event {
  id: string;
  name: string;
  type: string;
  description: string | null;
  start_date: string;
  end_date: string;
  target_countries: string[];
  status: 'active' | 'ended';
  created_at: string;
}

export interface Dashboard {
  id: string;
  event_id: string;
  name: string | null;
  dashboard_type: 'monitoring' | 'analysis';
  data_start_date: string;
  data_end_date: string;
  summary: {
    totalGold: number;
    totalRevenue: number;
    totalGiftCount: number;
    totalSenderCount: number;
    creatorCount: number;
  };
  ranking: {
    rank: number;
    uid: string;
    nickname: string;
    username: string;
    gold: number;
    revenue: number;
    giftCount: number;
    senderCount: number;
  }[];
  before_summary: {
    totalGold: number;
    totalRevenue: number;
    totalGiftCount: number;
    totalSenderCount: number;
    creatorCount: number;
  } | null;
  before_ranking: {
    rank: number;
    uid: string;
    nickname: string;
    username: string;
    gold: number;
    revenue: number;
    giftCount: number;
    senderCount: number;
  }[] | null;
  created_at: string;
}
