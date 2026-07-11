import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { User, UserUpdatePayload } from '../models/user.model';

const USER_COLUMNS = 'user_id, email, phone_number, username, avatar, status, role, created_at, date_of_birth, gender';

@Injectable({ providedIn: 'root' })
export class UserService {
  private cachedUser: User | null = null;
  async getCurrentUser(): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      throw new Error('Không thể xác thực người dùng.');
    }

    const { data, error } = await supabase
      .from('USER')
      .select(USER_COLUMNS)
      .eq('user_id', authData.user.id)
      .single();

    if (error || !data) {
      throw new Error('Không thể tải thông tin tài khoản.');
    }

    this.cachedUser = data as unknown as User;   
    return this.cachedUser;
  }

  async updateUser(userId: string, payload: UserUpdatePayload): Promise<User> {
    const { data, error } = await supabase
      .from('USER')
      .update(payload)
      .eq('user_id', userId)
      .select(USER_COLUMNS)
      .single();

    if (error || !data) {
      throw new Error('Cập nhật thông tin thất bại.');
    }

    this.cachedUser = data as unknown as User;   
    return this.cachedUser;
  }

  getCachedUser(): User | null {
    return this.cachedUser;
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    this.cachedUser = null;  
  }
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email;

    if (!email) {
      throw new Error('Không thể xác thực người dùng.');
    }

    // Xác thực lại mật khẩu hiện tại trước khi đổi
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });

    if (signInError) {
      throw new Error('Mật khẩu hiện tại không đúng.');
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      throw new Error('Đổi mật khẩu thất bại.');
    }
  }
}