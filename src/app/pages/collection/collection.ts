import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { GachaCard } from '../../components/gacha-card/gacha-card';
import { BookFlip, BookPage } from '../../components/book-flip/book-flip';
import { CollectionService, CollectionDetail } from '../../services/collection.service';

interface SectionBackgrounds {
  book: string;
  framecard: string;
  quote: string;
}

// Map tĩnh: collection_id -> đường dẫn ảnh trong public/Bg
// Thêm collection mới -> chỉ cần thêm 1 entry ở đây, không đụng gì khác
const COLLECTION_BACKGROUNDS: Record<string, SectionBackgrounds> = {
  'c5cdb514-873a-4937-a3d2-0ae5b86f3839': {
    book: '/Bg/Bg_starseed_book.png',
    framecard: '/Bg/Bg_starseed_framecard.png',
    quote: '/Bg/Bg_starseed_quotes.png'
  }
};

const DEFAULT_BACKGROUNDS: SectionBackgrounds = {
  book: '/Bg/Bg_starseed_book.png',
  framecard: '/Bg/Bg_starseed_framecard.png',
  quote: '/Bg/Bg_starseed_quotes.png'
};

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, Header, Footer, GachaCard, BookFlip],
  templateUrl: './collection.html',
  styleUrl: './collection.scss'
})
export class Collection implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private collectionService = inject(CollectionService);

  collection = signal<CollectionDetail | null>(null);
  isLoading = signal(true);
  backgrounds = signal<SectionBackgrounds>(DEFAULT_BACKGROUNDS);

  readonly bookCoverImage = '/Images/bookcover.png';
  readonly bookPages: BookPage[] = [
    { image: '/Images/page1.png' },
    { image: '/Images/page2.png' }
  ];

  readonly quoteText = '"Every figure is a piece of a dream captured in a jar."';
  readonly quoteAuthor = 'The Keeper of Stories';

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      const collectionId = params.get('id');

      if (!collectionId) {
        this.router.navigate(['/']);
        return;
      }

      this.isLoading.set(true);
      const data = await this.collectionService.getCollectionById(collectionId);

      if (!data) {
        this.router.navigate(['/']);
        return;
      }

      this.collection.set(data);
      this.backgrounds.set(COLLECTION_BACKGROUNDS[collectionId] ?? DEFAULT_BACKGROUNDS);
      this.isLoading.set(false);
    });
  }
}