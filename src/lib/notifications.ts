import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string | null;
  role_target: string | null;
  type: string;
  title: string;
  message: string;
  link_tab: string | null;
  link_id: string | null;
  read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}

export async function markAllRead(): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('read', false);
}

export async function createNotification(input: {
  user_id?: string | null;
  role_target?: string | null;
  type: string;
  title: string;
  message: string;
  link_tab?: string | null;
  link_id?: string | null;
}): Promise<void> {
  await supabase.from('notifications').insert(input);
}
