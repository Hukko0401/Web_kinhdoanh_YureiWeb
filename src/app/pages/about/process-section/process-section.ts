import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-process-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './process-section.html',
  styleUrl: './process-section.scss'
})
export class ProcessSection {}