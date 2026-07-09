import { Component, OnInit, OnDestroy,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  @Input() variant: 'default' | 'transparent' = 'default'
  isLoggedIn = false;
  isCollectionsOpen = false;
  isAvatarMenuOpen = false;
  private authSub?: Subscription;

  // TODO: thay bằng data thật từ collectionService.getCollections()
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
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    // Khi getCollections() có data thật, bỏ comment dòng dưới
    // this.collectionService.getCollections().then(data => this.activeCollections = data);
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  toggleCollections(state: boolean): void {
    this.isCollectionsOpen = state;
  }

}