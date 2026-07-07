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

  // TODO: thay bằng collectionService.getCollections() khi có data thật
  mockCollections: CollectionSlideData[] = [
    {
      id: '1',
      title: 'Collection 1',
      description: 'Lorem ipsum dolor sit amet consectetur. Eget id eleifend nulla proin massa. Cras feugiat faucibus pharetra id a gravida bibendum enim ut. Suspendisse nibh tortor a scelerisque fringilla consectetur feugiat elit vitae. Consectetur neque viverra fermentum vitae risus venenatis massa magna tincidunt.',
      imageUrl: 'https://placehold.co/432x502'
    },
    {
      id: '2',
      title: 'Collection 2',
      description: 'Lorem ipsum dolor sit amet consectetur. Eget id eleifend nulla proin massa. Cras feugiat faucibus pharetra id a gravida bibendum enim ut. Suspendisse nibh tortor a scelerisque fringilla consectetur feugiat elit vitae. Consectetur neque viverra fermentum vitae risus venenatis massa magna tincidunt.',
      imageUrl: 'https://placehold.co/432x502'
    },
    {
      id: '3',
      title: 'Collection 3',
      description: 'Lorem ipsum dolor sit amet consectetur. Eget id eleifend nulla proin massa. Cras feugiat faucibus pharetra id a gravida bibendum enim ut. Suspendisse nibh tortor a scelerisque fringilla consectetur feugiat elit vitae. Consectetur neque viverra fermentum vitae risus venenatis massa magna tincidunt.',
      imageUrl: 'https://placehold.co/432x502'
    }
  ]

  // TODO: thay bằng data thật lấy từ 5 collection khi backend xong
  mockSpotlightItems: SpotlightItem[] = [
    {
      id: 'sp1',
      name: 'Astro Kid',
      imageUrl: 'https://placehold.co/347x469',
      collectionId: '1'
    },
    {
      id: 'sp2',
      name: 'Happy Bunny',
      imageUrl: 'https://placehold.co/289x401',
      collectionId: '2'
    },
    {
      id: 'sp3',
      name: 'Shadow Twin',
      imageUrl: 'https://placehold.co/269x298',
      collectionId: '3'
    },
    {
      id: 'sp4',
      name: 'Flower Head',
      imageUrl: 'https://placehold.co/289x401',
      collectionId: '4'
    },
    {
      id: 'sp5',
      name: 'Santa Bear',
      imageUrl: 'https://placehold.co/269x298',
      collectionId: '5'
    }
  ];

  comingSoonItems: ComingSoonItem[] = [
  {
    title: 'Title',
    description: 'Lorem ipsum dolor sit amet consectetur. Arcu a urna egestas convallis diam euismod mauris.',
    videoUrl: '/Videos/Comming_soon_1.mp4' // cậu tự sửa path đúng khi lưu video vào public/
  },
  {
    title: 'Title',
    description: 'Lorem ipsum dolor sit amet consectetur. Arcu a urna egestas convallis diam euismod mauris.'
  },
  {
    title: 'Title',
    description: 'Lorem ipsum dolor sit amet consectetur. Arcu a urna egestas convallis diam euismod mauris.'
  }
];
mockArtists: ArtistData[] = [
  { id: 'a1', name: 'ARTIST NAME', bio: 'a scelerisque fringilla consectetur feugiat elit vitae. bjciakc f fv vdvs risus venenatis massa magna tincidunt.', imageUrl: 'https://placehold.co/450x329' },
  { id: 'a2', name: 'ARTIST NAME', bio: 'a scelerisque fringilla consectetur feugiat elit vitae. bjciakc f fv vdvs risus venenatis massa magna tincidunt.', imageUrl: 'https://placehold.co/322x234' },
  { id: 'a3', name: 'ARTIST NAME', bio: 'a scelerisque fringilla consectetur feugiat elit vitae. bjciakc f fv vdvs risus venenatis massa magna tincidunt.', imageUrl: 'https://placehold.co/322x234' },
  { id: 'a4', name: 'ARTIST NAME', bio: 'a scelerisque fringilla consectetur feugiat elit vitae. bjciakc f fv vdvs risus venenatis massa magna tincidunt.', imageUrl: 'https://placehold.co/322x234' },
  { id: 'a5', name: 'ARTIST NAME', bio: 'a scelerisque fringilla consectetur feugiat elit vitae. bjciakc f fv vdvs risus venenatis massa magna tincidunt.', imageUrl: 'https://placehold.co/322x234' }
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