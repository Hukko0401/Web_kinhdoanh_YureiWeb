import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-village-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './village-banner.html',
  styleUrl: './village-banner.scss'
})
export class VillageBanner implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('image', { static: true }) imageRef!: ElementRef<HTMLImageElement>;

  private maxTranslate = 0;
  private currentTranslate = 0;
  private direction: 1 | -1 = -1;
  private speed = 0.5;
  private rafId: number | null = null;
  private observer?: IntersectionObserver;
  private isRunning = false;

  ngAfterViewInit(): void {
    const img = this.imageRef.nativeElement;
    const setup = () => {
      this.recalculateMaxTranslate();
      this.setupObserver();
    };
    img.complete ? setup() : (img.onload = setup);
  }

  private recalculateMaxTranslate(): void {
  const img = this.imageRef.nativeElement;
  const container = this.containerRef.nativeElement;
  this.maxTranslate = Math.max(img.scrollWidth - container.clientWidth, 0);

  

  if (Math.abs(this.currentTranslate) > this.maxTranslate) {
    this.currentTranslate = -this.maxTranslate;
  }
}

  @HostListener('window:resize')
  onResize(): void {
    this.recalculateMaxTranslate();
  }

  private setupObserver(): void {
  if (!this.containerRef) return;

  this.observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        this.start();
      } else {
        this.stop();
      }
    },
    { threshold: 0.1 }
  );
  this.observer.observe(this.containerRef.nativeElement);
}

  private start(): void {
    if (this.isRunning || this.maxTranslate === 0) return;
    this.isRunning = true;
    this.animate();
  }

  private stop(): void {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    this.currentTranslate += this.speed * this.direction;

    if (this.currentTranslate <= -this.maxTranslate) {
      this.currentTranslate = -this.maxTranslate;
      this.direction = 1;
    } else if (this.currentTranslate >= 0) {
      this.currentTranslate = 0;
      this.direction = -1;
    }

    this.imageRef.nativeElement.style.transform = `translateX(${this.currentTranslate}px)`;
    this.rafId = requestAnimationFrame(this.animate);
  };

  ngOnDestroy(): void {
    this.stop();
    this.observer?.disconnect();
  }
}