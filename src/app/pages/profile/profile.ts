import { Component, OnInit, signal, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { supabase } from '../../supabase.client';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Header, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  loading = signal(true);
  currentUser: User | null = null;

  username = '';
  memberSince = '';
  avatarUrl = '';
  avatarFile: File | null = null;

  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const cached = this.userService.getCachedUser();
    if (cached) {
      this.currentUser = cached;
      this.populateSidebar(cached);
      this.loading.set(false);
    }
    await this.loadUser();
  }

  async loadUser() {
    const isFirstLoad = !this.currentUser;
    if (isFirstLoad) this.loading.set(true);

    try {
      const user = await this.userService.getCurrentUser();
      this.currentUser = user;
      this.populateSidebar(user);
    } catch (err) {
      // có thể set errorMessage nếu cần hiện lỗi ở sidebar
    } finally {
      this.loading.set(false);
    }
  }

  populateSidebar(u: User) {
    this.username = u.username ?? '';
    this.avatarUrl = u.avatar ?? '';
    this.memberSince = u.created_at
      ? new Date(u.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';
  }

  onAvatarClick() {
    this.avatarInput.nativeElement.click();
  }

  async onAvatarFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn file ảnh');
    return;
  }

  if (!this.currentUser) return;

  // Preview ngay lập tức
  const reader = new FileReader();
  reader.onload = () => {
    this.avatarUrl = reader.result as string;
    this.cdr.detectChanges();
  };
  reader.readAsDataURL(file);
  input.value = '';

  // Upload lên Supabase Storage ngay, không cần đợi bấm Save
  try {
    const publicUrl = await this.uploadAvatar(this.currentUser.user_id, file);

    const updated = await this.userService.updateUser(this.currentUser.user_id, {
      avatar: publicUrl
    });

    this.currentUser = updated;
    this.avatarUrl = publicUrl;   // dùng URL thật từ server, thay cho base64 preview tạm
    this.cdr.detectChanges();
  } catch (err) {
    console.error('Upload avatar failed:', err);
    // rollback preview nếu upload lỗi
    this.avatarUrl = this.currentUser.avatar ?? '';
    this.cdr.detectChanges();
  }
}

async uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }
}