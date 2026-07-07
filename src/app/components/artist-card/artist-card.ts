import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ArtistData {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
}

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artist-card.html',
  styleUrl: './artist-card.scss'
})
export class ArtistCard {
  @Input({ required: true }) data!: ArtistData;
  @Input() isCenter = false;
}