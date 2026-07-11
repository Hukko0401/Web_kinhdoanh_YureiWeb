import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { AlertService } from '../../../services/alert.service';
import { User } from '../../../models/user.model';
import { supabase } from '../../../supabase.client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {
  loading = signal(true);
  currentUser: User | null = null;

  linkedGoogle = signal(false);
  linkedApple = signal(false);

  notifyPromotions = signal(true);
  notifyExpiry = signal(true);
  notifyNewCollections = signal(true);

  deleting = signal(false);

  constructor(
    private userService: UserService,
    private alert: AlertService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    this.loading.set(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const identities = authData?.user?.identities ?? [];
      const providers = identities.map((i: any) => i.provider);
      this.linkedGoogle.set(providers.includes('google'));
      this.linkedApple.set(providers.includes('apple'));

      const user = this.userService.getCachedUser() ?? (await this.userService.getCurrentUser());
      this.currentUser = user;
      this.notifyPromotions.set(user.notify_promotions ?? true);
      this.notifyExpiry.set(user.notify_expiry ?? true);
      this.notifyNewCollections.set(user.notify_new_collections ?? true);
    } catch (err: any) {
      this.alert.show(err.message ?? 'Không thể tải cài đặt.');
    } finally {
      this.loading.set(false);
    }
  }

  async onConnectGoogle() {
    if (this.linkedGoogle()) return;
    const { error } = await supabase.auth.linkIdentity({ provider: 'google' });
    if (error) this.alert.show('Connect Google fail.');
  }

  async onConnectApple() {
    if (this.linkedApple()) return;
    const { error } = await supabase.auth.linkIdentity({ provider: 'apple' });
    if (error) this.alert.show('Connect Apple fail.');
  }

  async toggleNotifyPromotions() {
    const newValue = !this.notifyPromotions();
    this.notifyPromotions.set(newValue);
    await this.savePreference({ notify_promotions: newValue });
  }

  async toggleNotifyExpiry() {
    const newValue = !this.notifyExpiry();
    this.notifyExpiry.set(newValue);
    await this.savePreference({ notify_expiry: newValue });
  }

  async toggleNotifyNewCollections() {
    const newValue = !this.notifyNewCollections();
    this.notifyNewCollections.set(newValue);
    await this.savePreference({ notify_new_collections: newValue });
  }

  private async savePreference(payload: Partial<User>) {
    if (!this.currentUser) return;
    try {
      const updated = await this.userService.updateUser(this.currentUser.user_id, payload);
      this.currentUser = updated;
    } catch (err: any) {
      this.alert.show('Cập nhật thất bại.');
    }
  }

  async onDeleteAccount() {
    const confirmed = await this.alert.confirm(
  'ARE YOU SURE?<br>We\'re sorry to see you go. Once your account is deleted, it cannot be recovered.'
);
    if (!confirmed) return;

    this.deleting.set(true);
    try {
      // TODO: gọi Edge Function / API backend để xóa hẳn Supabase Auth user
      // Ví dụ: await supabase.functions.invoke('delete-account')
      await this.userService.logout();
      this.alert.show('Tài khoản đã được xóa.');
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.alert.show('Xóa tài khoản thất bại.');
    } finally {
      this.deleting.set(false);
    }
  }
}