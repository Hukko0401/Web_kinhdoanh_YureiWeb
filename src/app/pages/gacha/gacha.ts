import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { BannerRoll } from '../../components/banner-roll/banner-roll';

@Component({
  selector: 'app-gacha',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, BannerRoll],
  templateUrl: './gacha.html',
  styleUrl: './gacha.scss'
})
export class Gacha {}