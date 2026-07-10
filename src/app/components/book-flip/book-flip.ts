import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-flip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-flip.html',
  styleUrl: './book-flip.scss'
})
export class BookFlip {
  @Input() coverImage = '';       // mặt trước bìa
  @Input() coverBackImage = '';   // mặt sau bìa = trang trái khi mở (page1)
  @Input() rightPageImage = '';   // trang phải tĩnh (page2)

  isOpen = false;

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}