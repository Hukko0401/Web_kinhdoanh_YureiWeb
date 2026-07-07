import { Component, Input, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ComingSoonItem {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
}

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss'
})
export class ComingSoon implements AfterViewInit, OnDestroy {
  @Input({ required: true }) items: ComingSoonItem[] = [];
  @ViewChildren('videoEl') videoEls!: QueryList<ElementRef<HTMLVideoElement>>;

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Bị chặn do chưa có user gesture -> im lặng bỏ qua, video vẫn hiện hình
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    this.videoEls.forEach(ref => this.observer!.observe(ref.nativeElement));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}