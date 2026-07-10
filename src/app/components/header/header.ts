import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CollectionService } from '../../services/collection.service';
import { WalletService } from '../../services/wallet.service';
import { toSignal } from '@angular/core/rxjs-interop';

interface CollectionMenuItem {
  id: string | null; // null = chưa có data thật, chỉ minh họa
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

  // Chỉ khai báo kiểu ở đây, gán giá trị thật trong constructor bên dưới
  coinBalance!: Signal<number>;

  private authSub?: Subscription;

  activeCollections: CollectionMenuItem[] = [];
  navLinks = [
    { label: 'Banner', path: '/gacha' },
    { label: 'How to Roll', path: '/how-to-roll' },
    { label: 'About Us', path: '/about' }
  ];

  private readonly MENU_SLOT_COUNT = 5; // số ô hiển thị trong dropdown

  constructor(
    private authService: AuthService,
    private collectionService: CollectionService,
    private walletService: WalletService
  ) {
    // Đến đây walletService đã chắc chắn được gán xong -> an toàn để đọc this.walletService
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
}