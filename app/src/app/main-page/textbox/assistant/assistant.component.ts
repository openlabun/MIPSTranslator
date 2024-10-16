import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistantService } from '../../../Shared/Services/Assistant/assistant.service';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.css']
})
export class AssistantComponent implements OnInit {
  suggestions: string[] = [];
  private assistantService = inject(AssistantService);

  ngOnInit(): void {
    this.assistantService.inputManager.inputApp.valueChanges.subscribe((value: string) => {
      if (this.isValid(value)) {
        this.suggestions = this.assistantService.getSuggestions(value);
      } else {
        this.suggestions = [];
      }
    });
  }

  isValid(value: any): boolean {
    return value !== undefined && value !== '';
  }
}