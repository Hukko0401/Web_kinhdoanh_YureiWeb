import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CollectionNavItem {
  id: string;
  name: string;
  videoUrl?: string | null;
}

@Component({
  selector: 'app-collection-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collection-nav.html',
  styleUrl: './collection-nav.scss'
})
export class CollectionNav {
  collections = input<CollectionNavItem[]>([]);
  activeId = input<string | null>(null);

  select = output<string>();

  onSelect(id: string): void {
    this.select.emit(id);
  }
}