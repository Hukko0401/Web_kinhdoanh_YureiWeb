import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User, UserUpdatePayload } from '../../../models/user.model';
import { supabase } from '../../../supabase.client';
import { AlertService } from '../../../services/alert.service';
import { AppendToBodyDirective } from '../../../shared/append-to-body.directive';


@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, AppendToBodyDirective],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');

  currentUser: User | null = null;

  username = '';
  phoneNumber = '';
  dateOfBirth = '';
  gender = '';
  email = '';

  genderOptions = ['Male', 'Female', 'Other'];
  genderDropdownOpen = signal(false);
  authProvider = signal<'google' | 'other'>('other');

  saveSuccess = signal(false);
  saveErrorMsg = signal('');

  // ==== Change Password ====
  showChangePasswordModal = signal(false);
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  changePasswordError = signal('');
  changePasswordLoading = signal(false);

  constructor(private userService: UserService, private alert: AlertService) {}

  async ngOnInit() {
    await this.loadUser();
  }

  async loadUser() {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const { data: authData } = await supabase.auth.getUser();
      const identities = authData?.user?.identities ?? [];
      const providers = identities.map((i: any) => i.provider);
      this.authProvider.set(providers.includes('google') ? 'google' : 'other');

      const user = await this.userService.getCurrentUser();
      this.currentUser = user;
      this.populateForm(user);
    } catch (err: any) {
      this.errorMessage.set(err.message ?? 'Đã có lỗi xảy ra.');
    } finally {
      this.loading.set(false);
    }
  }

  populateForm(u: User) {
    this.username = u.username ?? '';
    this.phoneNumber = u.phone_number ?? '';
    this.dateOfBirth = u.date_of_birth ?? '';
    this.gender = u.gender ?? '';
    this.email = u.email ?? '';
  }

  async onSave() {
    if (!this.currentUser) return;
    this.saving.set(true);

    try {
      const payload: UserUpdatePayload = {
        username: this.username,
        phone_number: this.phoneNumber || undefined,
        date_of_birth: this.dateOfBirth || undefined,
        gender: this.gender || undefined,
        email: this.authProvider() === 'google' ? undefined : (this.email.trim() || undefined)
      };

      const updated = await this.userService.updateUser(this.currentUser.user_id, payload);
      this.currentUser = updated;
      this.populateForm(updated);
      this.alert.show('Update successful.');
    } catch (err: any) {
      this.alert.show(err.message ?? 'Update Failed.');
    } finally {
      this.saving.set(false);
    }
  }

  onCancel() {
    if (this.currentUser) this.populateForm(this.currentUser);
  }

  toggleGenderDropdown() { this.genderDropdownOpen.set(!this.genderDropdownOpen()); }
  selectGender(value: string) {
    this.gender = value;
    this.genderDropdownOpen.set(false);
  }
  closeGenderDropdown() { this.genderDropdownOpen.set(false); }

  // ==== Change Password ====
  onChangePasswordClick() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.changePasswordError.set('');
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.showChangePasswordModal.set(true);
  }

  closeChangePasswordModal() { this.showChangePasswordModal.set(false); }
  toggleCurrentPasswordVisibility() { this.showCurrentPassword.set(!this.showCurrentPassword()); }
  toggleNewPasswordVisibility() { this.showNewPassword.set(!this.showNewPassword()); }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword.set(!this.showConfirmPassword()); }

  async onSaveNewPassword() {
    this.changePasswordError.set('');

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.changePasswordError.set('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.changePasswordError.set('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.changePasswordError.set('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    this.changePasswordLoading.set(true);
    try {
      await this.userService.changePassword(this.currentPassword, this.newPassword);
      this.showChangePasswordModal.set(false);
    } catch (err: any) {
      this.changePasswordError.set(err.message ?? 'Đổi mật khẩu thất bại.');
    } finally {
      this.changePasswordLoading.set(false);
    }
  }
}