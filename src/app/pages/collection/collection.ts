import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { GachaCard } from '../../components/gacha-card/gacha-card';
import { BookFlip } from '../../components/book-flip/book-flip';
import { CollectionService, CollectionDetail } from '../../services/collection.service';

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

  readonly bookCoverImage = '/Images/bookcover.png';
  readonly bookCoverBackImage = '/Images/page1.png';
  readonly bookRightPageImage = '/Images/page2.png';

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
      this.isLoading.set(false);
    });
  }
}