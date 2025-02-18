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
    <div class="contributors-container" *ngIf="!errorMsg; else errorTpl">
      <div class="contributor" *ngFor="let c of contributors" (click)="openProfile(c.html_url)">
        <img [src]="c.avatar_url" [alt]="c.login" title="{{ c.login }}" />
        <p>{{ c.login }}</p>
      </div>
    </div>
    <ng-template #errorTpl>
      <p style="color: red;">{{ errorMsg }}</p>
    </ng-template>
  `,
  styles: [`
    .contributors-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
    .contributor {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 80px;
      cursor: pointer;
    }
    .contributor img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-bottom: 5px;
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
      next: (data) => {
        this.contributors = data;
      },
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
