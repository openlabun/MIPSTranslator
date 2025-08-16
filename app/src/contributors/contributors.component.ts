import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  // add other fields if needed
}

@Component({
  selector: 'app-contributors',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="contributors-wrapper" *ngIf="!errorMsg; else errorTpl">
      <div class="contributors-scroll">
        <div class="contributor" *ngFor="let c of contributors" (click)="openProfile(c.html_url)">
          <img [src]="c.avatar_url" [alt]="c.login" title="{{ c.login }}" />
          <p>{{ c.login }}</p>
        </div>
      </div>
    </div>
    <ng-template #errorTpl>
      <p style="color: red;">{{ errorMsg }}</p>
    </ng-template>
  `,
  styles: [`
    .contributors-wrapper {
      max-width: 100%;
      overflow-x: hidden; /* oculto por defecto */
      padding: 10px;
      border-radius: 8px;
      background-color: #fafafa;
      transition: all 0.3s ease;
    }

    .contributors-wrapper:hover {
      overflow-x: auto; /* mostrar scroll al hover */
    }

    .contributors-scroll {
      display: flex;
      gap: 12px;
      min-width: max-content;
      padding-bottom: 5px;
    }

    .contributor {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100px;
      flex-shrink: 0;
      padding: 10px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      cursor: pointer;
      text-align: center;
      font-family: "Nunito", sans-serif;
      transition: all 0.2s ease;
    }

    .contributor:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .contributor img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-bottom: 5px;
      object-fit: cover;
    }

    .contributor p {
      font-size: 0.9rem;
      word-wrap: break-word;
      white-space: normal;
      margin: 0;
      color: #3b3b3b;
    }

    /* Scrollbar horizontal */
    .contributors-wrapper::-webkit-scrollbar {
      height: 8px;
    }

    .contributors-wrapper::-webkit-scrollbar-track {
      background: #f5f5f5;
      border-radius: 10px;
      margin: 0 10px;
    }

    .contributors-wrapper::-webkit-scrollbar-thumb {
      background-color: #d1c4e9;
      border-radius: 10px;
      border: 2px solid #f5f5f5;
    }

    .contributors-wrapper::-webkit-scrollbar-thumb:hover {
      background-color: #b39ddb;
    }
  `]
})
export class ContributorsComponent implements OnInit {
  contributors: Contributor[] = [];
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const url = 'https://api.github.com/repos/proyectosingenieriauninorte/MIPSTranslator/contributors';
    this.http.get<Contributor[]>(url).subscribe({
      next: (data) => this.contributors = data,
      error: (error) => {
        console.error('Error fetching contributors:', error);
        this.errorMsg = 'Could not load contributors';
      }
    });
  }

  openProfile(url: string): void {
    window.open(url, '_blank');
  }
}
