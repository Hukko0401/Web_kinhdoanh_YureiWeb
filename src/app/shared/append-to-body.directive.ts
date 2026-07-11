import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appAppendToBody]',
  standalone: true,
})
export class AppendToBodyDirective implements OnInit, OnDestroy {
  private originalParent: Node | null = null;
  private originalNextSibling: Node | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const nativeEl = this.el.nativeElement;
    this.originalParent = nativeEl.parentNode;
    this.originalNextSibling = nativeEl.nextSibling;

    document.body.appendChild(nativeEl);
  }

  ngOnDestroy(): void {
    // Trả phần tử về đúng vị trí cũ trong DOM khi component bị hủy
    // (tránh rò rỉ bộ nhớ / lẫn lộn nếu component tái sử dụng)
    const nativeEl = this.el.nativeElement;
    if (nativeEl.parentNode === document.body) {
      document.body.removeChild(nativeEl);
    }
  }
}