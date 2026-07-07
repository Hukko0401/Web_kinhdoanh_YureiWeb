import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SpotlightItem {
  id: string;
  name: string;
  imageUrl: string;
  modelUrl?: string;
  collectionId: string;
}

@Component({
  selector: 'app-collect-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collect-showcase.html',
  styleUrl: './collect-showcase.scss'
})
export class CollectShowcase {
  @Input({ required: true }) items: SpotlightItem[] = [];
  centerIndex = 0;

  // Khai đủ 5 offset: -2, -1, 0, 1, 2 — càng ra xa center càng nhỏ dần
  private sizeMap: Record<number, { w: number; h: number }> = {
    [-2]: { w: 220, h: 244 },
    [-1]: { w: 269, h: 298 },
    0:    { w: 289, h: 401 },
    1:    { w: 269, h: 298 },
    2:    { w: 220, h: 244 },
  };

  private wrapIndex(i: number): number {
    const len = this.items.length;
    return ((i % len) + len) % len;
  }

  getOffset(index: number): number {
    const len = this.items.length;
    let raw = index - this.centerIndex;
    const half = len / 2;
    if (raw > half) raw -= len;
    if (raw < -half) raw += len;
    return raw;
  }

  getWidth(offset: number): number {
    return this.sizeMap[offset]?.w ?? 180;
  }

  getHeight(offset: number): number {
    return this.sizeMap[offset]?.h ?? 200;
  }

  private getGap(): number {
    const vw = window.innerWidth;
    const gap = (70.8 / 1440) * vw;
    return Math.min(Math.max(gap, 42), 80);
  }

  getTranslateX(offset: number): number {
    if (offset === 0) return 0;

    const dir = offset > 0 ? 1 : -1;
    const gap = this.getGap();
    let x = 0;
    let prevWidth = this.getWidth(0);

    for (let step = 1; step <= Math.abs(offset); step++) {
      const currentWidth = this.getWidth(dir * step);
      x += prevWidth / 2 + currentWidth / 2 + gap;
      prevWidth = currentWidth;
    }

    return dir * x;
  }


  abs(n: number): number {
    return Math.abs(n);
  }

  trackByItemId(_index: number, item: SpotlightItem): string {
    return item.id;
  }

  selectByIndex(index: number): void {
    this.centerIndex = this.wrapIndex(index);
  }
}