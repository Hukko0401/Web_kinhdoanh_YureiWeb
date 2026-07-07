import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss'
})
export class Carousel {
  @Input() slideCount = 0;
  currentIndex = 0;

  prev(): void {
    this.currentIndex = this.currentIndex === 0
      ? this.slideCount - 1
      : this.currentIndex - 1;
  }

  next(): void {
    this.currentIndex = this.currentIndex === this.slideCount - 1
      ? 0
      : this.currentIndex + 1;
  }
}