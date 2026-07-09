import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GachaService } from '../../services/gacha.service';
import { CollectionService } from '../../services/collection.service';
import { CollectionNav, CollectionNavItem } from '../collection-nav/collection-nav';
import { ResultOverlay, RollResultItem } from '../result-overlay/result-overlay';
import { HistoryOverlay, RollHistoryRow, BannerOption } from '../history-overlay/history-overlay';
import { ConfirmationOverlay } from '../confirmation-overlay/confirmation-overlay';
import { WalletService } from '../../services/wallet.service';

type RollPhase = 'idle' | 'playing' | 'done';

type OverlayState =
  | { type: 'none' }
  | { type: 'confirm-roll'; rollType: 'x1' | 'x5' }
  | { type: 'insufficient-coin' }
  | { type: 'error'; message: string }
  | { type: 'result'; items: RollResultItem[] }
  | { type: 'history' };

const HISTORY_PAGE_SIZE = 5;

@Component({
  selector: 'app-banner-roll',
  standalone: true,
  imports: [CommonModule, CollectionNav, ResultOverlay, HistoryOverlay, ConfirmationOverlay],
  templateUrl: './banner-roll.html',
  styleUrl: './banner-roll.scss'
})
export class BannerRoll implements OnInit, OnDestroy {
  @ViewChild('rollVideo') rollVideo?: ElementRef<HTMLVideoElement>;

  private readonly DEFAULT_VIDEO = '/Videos/banner_roll_vid.mp4';

  isLoggedIn = false;
  private authSub?: Subscription;
  private currentUserId: string | null = null;

  // Khởi tạo rỗng, sẽ được đổ data thật ngay trong ngOnInit() từ collectionService.getCollections()
  collections = signal<CollectionNavItem[]>([]);
  activeCollectionId = signal<string | null>(null);

  // Video hiện tại theo collection đang active, fallback về DEFAULT_VIDEO nếu collection
  // chưa gán video riêng (cột "video" trong Supabase là null/rỗng)
  activeVideoUrl = computed(() => {
    const id = this.activeCollectionId();
    const found = this.collections().find(c => c.id === id);
    return found?.videoUrl || this.DEFAULT_VIDEO;
  });

  phase = signal<RollPhase>('idle');
  overlay = signal<OverlayState>({ type: 'none' });

  confirmRollType = computed(() => {
    const o = this.overlay();
    return o.type === 'confirm-roll' ? o.rollType : null;
  });
  errorMessage = computed(() => {
    const o = this.overlay();
    return o.type === 'error' ? o.message : '';
  });
  resultItems = computed(() => {
    const o = this.overlay();
    return o.type === 'result' ? o.items : [];
  });

  historyRows = signal<RollHistoryRow[]>([]);
  historyBanners = signal<BannerOption[]>([]);
  historyCurrentPage = signal<number>(1);
  historyTotalPages = signal<number>(1);
  selectedBannerId = signal<string | null>(null);

  private pendingResultItems: RollResultItem[] = [];

  constructor(
    private authService: AuthService,
    private gachaService: GachaService,
    private collectionService: CollectionService,
    private router: Router,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUserId = user?.id ?? null;
    });
  
    this.collectionService.getCollections().then(({ data, error }) => {
      if (error) {
        console.error('Load collections failed:', error);
        return;
      }
      if (data.length === 0) return;
  
      this.collections.set(
        data.map(c => ({ id: c.id, name: c.name, videoUrl: c.videoUrl }))
      );
      this.activeCollectionId.set(data[0].id);
  
      // <source> đã được render với DEFAULT_VIDEO lúc đầu (trước khi có data thật),
      // cần ép load lại để trình duyệt đọc đúng activeVideoUrl() vừa cập nhật
      this.rollVideo?.nativeElement.load();
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  onSelectCollection(id: string): void {
    if (this.phase() !== 'idle') return;
    this.activeCollectionId.set(id);
    // <source> chỉ đọc 1 lần lúc video khởi tạo, phải ép load lại khi đổi collection
    this.rollVideo?.nativeElement.load();
  }

  onRollClick(type: 'x1' | 'x5'): void {
    if (!this.isLoggedIn || !this.activeCollectionId() || this.phase() !== 'idle') return;
    this.overlay.set({ type: 'confirm-roll', rollType: type });
  }

 async onConfirmRoll(): Promise<void> {
    const rollType = this.confirmRollType();
    const collectionId = this.activeCollectionId();

    if (!this.currentUserId || !rollType || !collectionId) return;

    this.overlay.set({ type: 'none' });

    const { data, error } = rollType === 'x1'
      ? await this.gachaService.rollOne(this.currentUserId, collectionId)
      : await this.gachaService.rollFive(this.currentUserId, collectionId);

    if (error) {
      if (error.code === 'INSUFFICIENT_COIN') {
        this.overlay.set({ type: 'insufficient-coin' });
      } else {
        this.overlay.set({ type: 'error', message: error.message });
      }
      return;
    }

    // Roll xong = đã trừ coin ở backend -> fetch lại balance mới nhất
    this.walletService.refreshBalance(this.currentUserId);

    this.pendingResultItems = data ?? [];
    this.phase.set('playing');
    this.rollVideo?.nativeElement.play();
  }


  onCancelConfirm(): void {
    this.overlay.set({ type: 'none' });
  }

  onGoTopUp(): void {
    this.overlay.set({ type: 'none' });
    this.router.navigate(['/top-up']);
  }

  onVideoEnded(): void {
    this.phase.set('done');
    this.overlay.set({ type: 'result', items: this.pendingResultItems });
  }

  onCloseResult(): void {
    this.overlay.set({ type: 'none' });
    this.phase.set('idle');
    this.pendingResultItems = [];
    this.rollVideo?.nativeElement.load();
  }

  onOpenHistory(): void {
    if (!this.isLoggedIn || !this.currentUserId || this.phase() !== 'idle') return;

    this.historyBanners.set(this.collections().map(c => ({ collectionId: c.id, name: c.name })));
    this.selectedBannerId.set(this.activeCollectionId());

    this.overlay.set({ type: 'history' });
    this.loadHistory(1, this.activeCollectionId() ?? undefined);
  }

  onCloseHistory(): void {
    this.overlay.set({ type: 'none' });
  }

  onHistoryPageChange(page: number): void {
    this.loadHistory(page, this.selectedBannerId() ?? undefined);
  }

  onHistoryBannerChange(collectionId: string): void {
    this.selectedBannerId.set(collectionId);
    this.loadHistory(1, collectionId);
  }

  private async loadHistory(page: number, collectionId?: string): Promise<void> {
    if (!this.currentUserId) return;

    const { data, error } = await this.gachaService.getRollHistory(
      this.currentUserId,
      collectionId,
      page,
      HISTORY_PAGE_SIZE
    );

    if (error) {
      console.error('Load history failed:', error);
      return;
    }

    this.historyRows.set(data?.rows ?? []);
    this.historyCurrentPage.set(page);
    this.historyTotalPages.set(Math.max(1, Math.ceil((data?.total ?? 0) / HISTORY_PAGE_SIZE)));
  }
}