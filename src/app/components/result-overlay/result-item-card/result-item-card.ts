import { Component, input, output, HostListener } from '@angular/core';

@Component({
  selector: 'app-result-item-card',
  standalone: true,
  templateUrl: './result-item-card.html',
  styleUrl: './result-item-card.scss'
})
export class ResultItemCard {
  itemName = input.required<string>();
  imageUrl = input.required<string>();
  isHighlighted = input<boolean>(false); // do cha quyết định

  hovered = output<void>();

  @HostListener('mouseenter')
  onMouseEnter() {
    this.hovered.emit();
  }
}