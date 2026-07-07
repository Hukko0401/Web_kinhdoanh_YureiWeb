import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistCard, ArtistData } from '../artist-card/artist-card';

interface PositionedArtist extends ArtistData {
  distance: number;
}

@Component({
  selector: 'app-artists-showcase',
  standalone: true,
  imports: [CommonModule, ArtistCard],
  templateUrl: './artists-showcase.html',
  styleUrl: './artists-showcase.scss'
})
export class ArtistsShowcase {
  @Input({ required: true }) artists: ArtistData[] = [];
  centerIndex = 0;

  get positioned(): PositionedArtist[] {
    const len = this.artists.length;
    return this.artists.map((artist, i) => {
      let distance = i - this.centerIndex;
      if (distance > len / 2) distance -= len;
      if (distance < -len / 2) distance += len;
      return { ...artist, distance };
    });
  }

  selectByDistance(distance: number): void {
    if (distance === 0) return;
    const len = this.artists.length;
    this.centerIndex = ((this.centerIndex + distance) % len + len) % len;
  }

  abs(n: number): number {
    return Math.abs(n);
  }

  trackByArtist(index: number, artist: ArtistData): string {
    return artist.id;
  }
}