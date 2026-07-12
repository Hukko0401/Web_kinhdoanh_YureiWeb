import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'
import { supabase } from '../../supabase.client'
import { Header } from '../../components/header/header'
import { AuthService } from '../../services/auth.service'
import { Carousel } from '../../components/carousel/carousel';
import { CollectionSlide, CollectionSlideData } from '../../components/collection-slide/collection-slide';
import { CollectShowcase, SpotlightItem } from '../../components/collect-showcase/collect-showcase';
import {VillageBanner} from '../../components/village-banner/village-banner'
import { ComingSoon, ComingSoonItem } from '../../components/coming-soon/coming-soon'
import { ArtistsShowcase } from '../../components/artists-showcase/artists-showcase';
import { ArtistData } from '../../components/artist-card/artist-card';
import { Footer } from '../../components/footer/footer'
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, Header, Carousel, CollectionSlide, CollectShowcase,VillageBanner,ComingSoon, ArtistsShowcase,Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  isLoggedIn = false
  private authSub?: Subscription

  mockCollections: CollectionSlideData[] = [
    {
      id: '1',
      title: 'willusion',
      description: 'Step into Willusion and discover a dreamy village alive with the gentle magic of mini witches. Let these sweet, enchanting wanderers bring a touch of fairytale wonder straight to your collection.',
      imageUrl: '/Images/willusion.png'
    },
    {
      id: '2',
      title: 'Celestial Zodiac',
      description: 'Hidden above the clouds, where dreams quietly shape the world, twelve Celestial Zodiac Spirits watch over the harmony of nature and the heart. Each guardian protects a precious blessing - from dreams and starlight to memories, hope, and happiness - bringing a timeless Eastern fantasy to life in this enchanting designer toy collection.',
      imageUrl: '/Images/celestial_zodiac.png'
    },
    {
      id: '3',
      title: "Auré's Whispers",
      description: "Hidden between reality and dreams, Auré is an ancient perfume house where fragrances are distilled from flowers, memories, and emotions. Each scent awakens into a tiny Fragrance Spirit, bringing every story in Auré's Whispers to life.",
      imageUrl: '/Images/aure.png'
    },
    {
      id: '4',
      title: "Starseed- Crystal Genesis",
      description: "Hidden within the heart of ancient crystals, twelve Starseeds quietly await their awakening. Inspired by the beauty of natural gemstones, each spirit carries a unique emotion and a fragment of starlight, inviting collectors into a world where the cosmos and the Earth become one.",
      imageUrl: '/Images/starseed.png'
    },
    {
      id: '5',
      title: "FORGOTTEN SOULS",
      description: "Within a forgotten island, twelve lost souls remain trapped in an endless cycle. Each figure preserves a fragment of memory, waiting for someone to piece together the truth that was never meant to be found, where every identity hides another piece of the same fractured mind.",
      imageUrl: '/Images/FS.png'
    },
  ]

  mockSpotlightItems: SpotlightItem[] = [
    {
      id: 'sp1',
      name: 'Willusion',
      imageUrl: '/Images/will_item1.png',
      collectionId: '1'
    },
    {
      id: 'sp2',
      name: 'Celestial',
      imageUrl: '/Images/celestial_item2.png',
      collectionId: '2'
    },
    {
      id: 'sp3',
      name: 'Aure',
      imageUrl: '/Images/aure_item3.png',
      collectionId: '3'
    },
    {
      id: 'sp4',
      name: 'Starseed',
      imageUrl: '/Images/starseed_item4.png',
      collectionId: '4'
    },
    {
      id: 'sp5',
      name: 'Forgotten Souls',
      imageUrl: '/Images/FS_item5.png',
      collectionId: '5'
    }
  ];

  comingSoonItems: ComingSoonItem[] = [
  {
    title: 'Twinkle Twinkle',
    description: 'A sparkling journey beneath the stars, filled with dreamy moments and adorable surprises.',
    videoUrl: '/Videos/Comming_soon_1.mp4' 
  },
  {
    title: 'Shibuya Scramble',
    description: 'Experience the excitement of Tokyo through vibrant characters and energetic street adventures',
    imageUrl:'/Images/shibuya.png'
  },
  {
    title: 'Daydream',
    description: 'Escape into a world of sunshine, soft breezes, and peaceful little dreams.',
    imageUrl:'/Images/daydream.png'
  }
];
mockArtists: ArtistData[] = [
  { id: 'a1', name: 'nae', bio: "I like sleep. I hope sleep likes me too, because I'm clearly putting more effort into this relationship.", imageUrl: '/Images/nae.png' },
  { id: 'a2', name: 'MINA', bio: 'A dreamer with a deep love for Eastern mythology, quiet moments, and the magic hidden in everyday life.', imageUrl: '/Images/MINA.png' },
  { id: 'a3', name: 'GRIZZLY', bio: 'Loves tarot, crystals, and collecting little moments of wonder. Probably taking a nap when not making art.', imageUrl: '/Images/GRIZZLY.png' },
  { id: 'a4', name: 'SOPHIA', bio: 'Powered by tea and a questionable sleep schedule. Always chasing pretty colors and one more creative idea.', imageUrl: '/Images/SOPHIA.png' },
  { id: 'a5', name: 'HukKo', bio: 'A cheerful soul with a curious mind, turning little moments and big emotions into stories.', imageUrl: '/Images/HukKo.png' }
];

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user
    })

    const { data, error } = await supabase.from('DROP_RATE').select('*')
    console.log('data:', data)
    console.log('error:', error)
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe()
  }
}