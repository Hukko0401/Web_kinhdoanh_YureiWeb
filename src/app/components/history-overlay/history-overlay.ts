import { Component, input, output } from '@angular/core';

export interface RollHistoryRow {
  rollHistoryId: string;  // dùng làm track key duy nhất
  banner: string;
  itemName: string;
  rarity: string;
  timestamp: string;
}

export interface BannerOption {
  collectionId: string;
  name: string;
}

@Component({
  selector: 'app-history-overlay',
  standalone: true,
  templateUrl: './history-overlay.html',
  styleUrl: './history-overlay.scss'
})
export class HistoryOverlay {
  // dữ liệu trang hiện tại, tối đa 5 dòng — cha chịu trách nhiệm query & phân trang
  rows = input<RollHistoryRow[]>([]);

  // danh sách banner cho dropdown lọc
  banners = input<BannerOption[]>([]);
  selectedBannerId = input<string | null>(null);

  currentPage = input<number>(1);
  totalPages = input<number>(1);

  close = output<void>();
  bannerChange = output<string>();
  pageChange = output<number>();

  onBannerSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.bannerChange.emit(value);
  }

  goPrev(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  goNext(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  // giữ số dòng cố định = 5, dòng trống để lấp chỗ nếu ít data hơn 5
  get placeholderRows(): number[] {
    const missing = 5 - this.rows().length;
    return missing > 0 ? Array(missing).fill(0) : [];
  }
}