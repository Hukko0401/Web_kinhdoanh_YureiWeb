import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { HeroSection } from './hero-section/hero-section';
import { AboutSection } from './about-section/about-section';
import { FeaturesSection } from './features-section/features-section';
import { ProcessSection } from './process-section/process-section';
import { CtaSection } from './cta-section/cta-section';

@Component({
  selector: 'app-about',
  standalone: true,
  // imports: [Header, Footer, HeroSection, AboutSection, FeaturesSection, ProcessSection, CtaSection],
  imports: [Header, Footer, HeroSection, AboutSection, FeaturesSection, ProcessSection],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {}