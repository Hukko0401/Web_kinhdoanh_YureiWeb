import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rarity } from '../../models/item.model';

const BACK_IMAGE_MAP: Record<Rarity, string> = {
  Common: '/Images/commoncard_back.png',
  Rare: '/Images/rarecard_back.png',
  Epic: '/Images/epiccard_back.png',
  Legendary: '/Images/legendarycard_back.png',
  Secret: '/Images/secretcard_back.png'
};

@Component({
  selector: 'app-gacha-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gacha-card.html',
  styleUrl: './gacha-card.scss'
})
export class GachaCard {
  @Input() rarity: Rarity = 'Common';
  @Input() name = 'Item';
  @Input() image = 'https://placehold.co/241x356'; // front - ảnh nhân vật từ Supabase
  @Input() backImage = ''; // custom back, nếu để trống -> auto theo rarity

  isFlipped = false;

  get rarityKey(): string {
    return this.rarity.toLowerCase();
  }

  get resolvedBackImage(): string {
    return this.backImage?.trim() ? this.backImage : BACK_IMAGE_MAP[this.rarity];
  }

  toggleFlip(): void {
    this.isFlipped = !this.isFlipped;
  }
}