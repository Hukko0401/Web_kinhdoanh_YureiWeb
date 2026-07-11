import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  async getMyNotifications(): Promise<AppNotification[]> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) return [];

    const { data, error } = await supabase
      .from('NOTIFICATION')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('time', { ascending: false });

    if (error || !data) return [];

    return data as unknown as AppNotification[];
  }
}