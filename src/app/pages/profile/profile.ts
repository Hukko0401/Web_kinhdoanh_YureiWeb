import { Component, OnInit, signal, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

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

  onAvatarFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    this.avatarFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';

    // TODO: upload lên Supabase Storage rồi update vào user.avatar
    // (giống logic uploadAvatar() bạn đã có trong onSave() cũ,
    // giờ có thể tách thành 1 hàm riêng gọi ngay khi chọn ảnh,
    // hoặc giữ nguyên trong account.ts nếu bạn muốn lưu chung lúc bấm Save)
  }

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }
}