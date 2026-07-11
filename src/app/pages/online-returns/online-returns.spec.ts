import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineReturns } from './online-returns';

describe('OnlineReturns', () => {
  let component: OnlineReturns;
  let fixture: ComponentFixture<OnlineReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
