import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CollectionService } from '../../services/collection.service';
import { WalletService } from '../../services/wallet.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { signal } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { AppNotification } from '../../models/notification.model';


interface CollectionMenuItem {
  id: string | null;
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  @Input() variant: 'default' | 'transparent' = 'default';

  isLoggedIn = false;
  isCollectionsOpen = false;
  isAvatarMenuOpen = false;
  isMobileMenuOpen = false;
  notifications = signal<AppNotification[]>([]);
  isNotificationsOpen = signal(false);
  showAllNotifications = signal(false); 

  coinBalance!: Signal<number>;

  private authSub?: Subscription;

  activeCollections: CollectionMenuItem[] = [];
  navLinks = [
    { label: 'Banner', path: '/gacha' },
    { label: 'How to Roll', path: '/how-to-roll' },
    { label: 'About Us', path: '/about' }
  ];

  private readonly MENU_SLOT_COUNT = 5;

  constructor(
    private authService: AuthService,
    private collectionService: CollectionService,
    private walletService: WalletService,
    private notificationService: NotificationService   
  ) {
    this.coinBalance = toSignal(this.walletService.balance$, { initialValue: 0 });
  }

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;

      if (user?.id) {
        this.walletService.refreshBalance(user.id);
      }
    });

    this.loadCollections();
  }

  private async loadCollections(): Promise<void> {
    try {
      const { data: collections, error } = await this.collectionService.getCollections();

      if (error) {
        console.error('Load collections for header failed:', error);
      }

      const real: CollectionMenuItem[] = (collections ?? []).map(c => ({
        id: c.id,
        name: c.name
      }));

      const placeholderCount = Math.max(this.MENU_SLOT_COUNT - real.length, 0);
      const placeholders: CollectionMenuItem[] = Array.from(
        { length: placeholderCount },
        (_, i) => ({ id: null, name: `Coming Soon ${i + 1}` })
      );

      this.activeCollections = [...real, ...placeholders];
    } catch (e) {
      console.error('Load collections for header failed:', e);
      this.activeCollections = Array.from(
        { length: this.MENU_SLOT_COUNT },
        (_, i) => ({ id: null, name: `Coming Soon ${i + 1}` })
      );
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  toggleCollections(state: boolean): void {
    this.isCollectionsOpen = state;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  
  async toggleNotifications(): Promise<void> {
    this.isNotificationsOpen.set(!this.isNotificationsOpen());
    if (this.isNotificationsOpen()) {
      this.showAllNotifications.set(false);
      const list = await this.notificationService.getMyNotifications();
      this.notifications.set(list);
    }
  }

  closeNotifications(): void {
    this.isNotificationsOpen.set(false);
  }

  get visibleNotifications() {  
    const list = this.notifications();
    return this.showAllNotifications() ? list.slice(0, 10) : list.slice(0, 3);
  }

  onViewAllNotifications(): void {   
    this.showAllNotifications.set(true);
  }

  formatNotificationTime(isoTime: string): string {
  const now = new Date();
  const time = new Date(isoTime);
  const diffMs = now.getTime() - time.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  const day = time.getDate();
  const month = time.toLocaleString('en-US', { month: 'short' });
  const year = time.getFullYear();
  return `${day} ${month} ${year}`;
}
}