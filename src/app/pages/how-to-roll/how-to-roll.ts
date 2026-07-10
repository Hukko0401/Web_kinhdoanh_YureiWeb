import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

interface RollStep {
  step: string;
  title: string;
  description: string;
  imageUrl: string;
  badgeColor: string;
  align: 'left' | 'right';
}

@Component({
  selector: 'app-how-to-roll',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './how-to-roll.html',
  styleUrl: './how-to-roll.scss'
})
export class HowToRoll {
  steps: RollStep[] = [
    {
      step: 'STEP 01',
      title: 'Register / Login',
      description: 'Start your journey by creating an account or logging into your existing profile to access exclusive features and track your collection.',
      imageUrl: '/Icons/step1.png',
      badgeColor: '#F2CA50',
      align: 'right'
    },
    {
      step: 'STEP 02',
      title: 'Top up Coins',
      description: 'Add coins to your wallet to get ready for the ultimate rolling experience. Secure and fast payment methods are available for your convenience.',
      imageUrl: '/Icons/step2.png',
      badgeColor: '#BADAFF',
      align: 'left'
    },
    {
      step: 'STEP 03',
      title: 'Roll Banner',
      description: "Choose your favorite series and roll the banner to discover exclusive collectibles. Every roll brings you closer to finding that rare 'Secret' figure.",
      imageUrl: '/Icons/step3.png',
      badgeColor: '#F2CA50',
      align: 'right'
    },
    {
      step: 'STEP 04',
      title: 'Pick and Ship',
      description: 'Select your desired items from your inventory and have them shipped directly to your doorstep. Manage your collection and track your deliveries with ease.',
      imageUrl: '/Icons/step4.png',
      badgeColor: '#BADAFF',
      align: 'left'
    }
  ];
}