import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
}

@Component({
  selector: 'app-contributors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contributors.component.html',
  styleUrl: './contributors.component.css',
})
export class ContributorsComponent implements OnInit {
  contributors: Contributor[] = [];
  errorMsg = '';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    const url =
      'https://api.github.com/repos/proyectosingenieriauninorte/MIPSTranslator/contributors';

    this.http.get<Contributor[]>(url).subscribe({
      next: (data) => {
        this.contributors = data;
      },
      error: (error) => {
        console.error('Error fetching contributors:', error);
        this.errorMsg = 'Could not load contributors';
      },
    });
  }

  openProfile(url: string): void {
    window.open(url, '_blank');
  }
}
