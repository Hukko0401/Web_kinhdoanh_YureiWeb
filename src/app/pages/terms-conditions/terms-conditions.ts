import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './terms-conditions.html',
  styleUrls: ['./terms-conditions.scss']
})
export class TermsConditions {
}