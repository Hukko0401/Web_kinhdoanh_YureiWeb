import { Component, input, output, signal, effect } from '@angular/core';
import { ResultItemCard } from './result-item-card/result-item-card';

export interface RollResultItem {
  rollHistoryId: string;  // dùng làm track key duy nhất
  itemName: string;
  imageUrl: string;
}

@Component({
  selector: 'app-result-overlay',
  standalone: true,
  imports: [ResultItemCard],
  templateUrl: './result-overlay.html',
  styleUrl: './result-overlay.scss'
})
export class ResultOverlay {
  items = input.required<RollResultItem[]>();
  close = output<void>();

  private activeIndex = signal<number>(-1);

  constructor() {
    effect(() => {
      // mỗi khi items() thay đổi (kể cả set lần đầu), active lại về item cuối cùng
      this.activeIndex.set(this.items().length - 1);
    });
  }

  isActive(index: number): boolean {
    return this.activeIndex() === index;
  }

  onItemHover(index: number): void {
    this.activeIndex.set(index);
  }
}