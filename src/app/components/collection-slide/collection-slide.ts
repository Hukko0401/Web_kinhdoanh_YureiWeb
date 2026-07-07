import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CollectionSlideData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-collection-slide',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collection-slide.html',
  styleUrl: './collection-slide.scss'
})
export class CollectionSlide {
  @Input({ required: true }) data!: CollectionSlideData;
}