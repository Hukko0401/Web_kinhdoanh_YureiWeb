import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  iconBg: string;
  title: string;
  titleColor: string;
  description: string;
  linkText: string;
  linkColor: string;
  cardBg: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-section.html',
  styleUrl: './features-section.scss'
})
export class FeaturesSection {
  features: Feature[] = [
    {
      icon: '/Icons/ic_about1.png',
      iconBg: '#FFF4B7',
      title: 'Exclusive Artist Collections',
      titleColor: '#E3C14E',
      description: 'Every collection is created in collaboration with talented local artists. Each character is an original design with its own story, personality, and rarity - available exclusively on YURĒI.',
      linkText: 'Find out more!',
      linkColor: '#F2CA50',
      cardBg: 'rgba(254, 255, 234, 0.80)',
    },
    {
      icon: '/Icons/ic_about2.png',
      iconBg: '#B4EBFF',
      title: 'Gacha Experience',
      titleColor: '#78DBFF',
      description: 'Only YURĒI combines authentic blind box collecting with a transparent Gacha system, featuring pity mechanics, rarity tiers, and rewarding duplicate exchanges.',
      linkText: 'Roll now!',
      linkColor: '#00A9E3',
      cardBg: 'rgba(231, 249, 255, 0.80)',
    },
    {
      icon: '/Icons/ic_about3.png',
      iconBg: '#FFD8EA',
      title: 'Made-to-Order',
      titleColor: '#EFB1D3',
      description: 'At YURĒI, every figure is produced on demand to reduce waste while maintaining premium quality. Collect, store, and ship your favorites anywhere in the world.',
      linkText: 'Join us now!',
      linkColor: '#FF99C5',
      cardBg: 'rgba(255, 234, 244, 0.80)',
    },
  ];
}