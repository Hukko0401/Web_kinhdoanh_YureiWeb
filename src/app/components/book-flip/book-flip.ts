import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BookPage {
  image: string;
}

@Component({
  selector: 'app-book-flip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-flip.html',
  styleUrl: './book-flip.scss'
})
export class BookFlip {
  @Input() coverImage = '';
  @Input() pages: BookPage[] = []; // các trang lá, theo cặp trái-phải

  isOpen = false;
  spreadIndex = 0;
  isFlipping = false;

  get spreads(): BookPage[][] {
    const result: BookPage[][] = [];
    for (let i = 0; i < this.pages.length; i += 2) {
      result.push(this.pages.slice(i, i + 2));
    }
    return result;
  }

  get currentSpread(): BookPage[] {
    return this.spreads[this.spreadIndex] ?? [];
  }

  get hasNext(): boolean {
    if (!this.isOpen) return this.pages.length > 0;
    return this.spreadIndex < this.spreads.length - 1;
  }

  get hasPrev(): boolean {
    return this.isOpen;
  }

  openBook(): void {
    if (this.isOpen || this.isFlipping || this.pages.length === 0) return;
    this.isFlipping = true;
    setTimeout(() => {
      this.isOpen = true;
      this.spreadIndex = 0;
      this.isFlipping = false;
    }, 400);
  }

  nextPage(): void {
    if (this.isFlipping) return;
    if (!this.isOpen) {
      this.openBook();
      return;
    }
    if (this.spreadIndex >= this.spreads.length - 1) return;
    this.isFlipping = true;
    setTimeout(() => {
      this.spreadIndex++;
      this.isFlipping = false;
    }, 400);
  }

  prevPage(): void {
    if (this.isFlipping || !this.isOpen) return;
    this.isFlipping = true;
    setTimeout(() => {
      if (this.spreadIndex === 0) {
        this.isOpen = false;
      } else {
        this.spreadIndex--;
      }
      this.isFlipping = false;
    }, 400);
  }
}