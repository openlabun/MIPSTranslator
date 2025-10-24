import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
}

@Component({
  selector: 'app-contributors',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './contributors.component.html',
  styleUrls: ['./contributors.component.css']
})
export class ContributorsComponent implements OnInit {
  contributors: Contributor[] = [];
  errorMsg = '';
  currentIndex = 0;
  itemsPerPage = 6;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadContributors();
  }

  private loadContributors(): void {
    const url = 'https://api.github.com/repos/proyectosingenieriauninorte/MIPSTranslator/contributors';
    this.http.get<Contributor[]>(url).subscribe({
      next: (data) => {
        this.contributors = data;
      },
      error: (error) => {
        console.error('Error fetching contributors:', error);
        this.errorMsg = 'Could not load contributors';
      }
    });
  }

  get visibleContributors(): Contributor[] {
    const start = this.currentIndex;
    const end = start + this.itemsPerPage;
    return this.contributors.slice(start, end);
  }

  get canGoPrev(): boolean {
    return this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentIndex + this.itemsPerPage < this.contributors.length;
  }

  slideNext(): void {
    if (this.canGoNext) {
      this.currentIndex++;
    }
  }

  slidePrev(): void {
    if (this.canGoPrev) {
      this.currentIndex--;
    }
  }

  trackByLogin(index: number, contributor: Contributor): string {
    return contributor.login;
  }

  openProfile(url: string): void {
    window.open(url, '_blank');
  }
}