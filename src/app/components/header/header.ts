import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CollectionService } from '../../services/collection.service';
import { WalletService } from '../../services/wallet.service';
import { toSignal } from '@angular/core/rxjs-interop';

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

  activeCollections = [
    { id: '1', name: 'Menu 1' },
    { id: '2', name: 'Menu 2' },
    { id: '3', name: 'Menu 3' },
    { id: '4', name: 'Menu 4' },
    { id: '5', name: 'Menu 5' }
  ];

  navLinks = [
    { label: 'Banner', path: '/gacha' },
    { label: 'How to Roll', path: '/how-to-roll' },
    { label: 'About Us', path: '/about' }
  ];

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