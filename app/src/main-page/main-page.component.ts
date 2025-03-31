import { Component, inject, model } from '@angular/core';
import {
  AutoSuggestBoxComponent,
  QuerySubmittedEvent,
} from '../auto-suggest-box/auto-suggest-box.component';
import {
  ListViewComponent,
  SelectionChangedEvent,
} from '../list-view/list-view.component';
import { MipsDetailComponent } from '../mips-detail/mips-detail.component';
import { DecodedInstruction } from '../Shared/lib/mips/instruction';
import { AssistantService } from '../Shared/Services/Assistant/assistant.service';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [AutoSuggestBoxComponent, ListViewComponent, MipsDetailComponent],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent {
  private readonly assistant = inject(AssistantService);
  private readonly translator = inject(TranslatorService);

  readonly instructions: DecodedInstruction[] = [];
  readonly suggestions: string[] = [];

  textInput = model<string>('');
  selected: DecodedInstruction | undefined = undefined;

  onInputUpdated(newValue: string) {
    this.suggestions.splice(0, this.suggestions.length);
    if (newValue) {
      this.suggestions.push(...this.assistant.getSuggestions(newValue));
    }
  }

  onInputSubmitted(e: QuerySubmittedEvent) {
    if (e.chosenSuggestion) {
      this.suggestions.splice(0, this.suggestions.length);
      this.textInput.set(e.chosenSuggestion);
      return;
    }

    this.textInput.set('');
    const parsed = this.translator.tryParse(e.queryText);

    if (parsed.stage === 'complete') {
      this.instructions.push(parsed.instruction);
      return;
    }
    alert('Invalid input');
  }

  onInstructionSelected(args: SelectionChangedEvent) {
    this.selected = args.selectedItem as DecodedInstruction;
  }

  toAsm(instruction: DecodedInstruction) {
    return this.translator.toAsm(instruction);
  }

  toHex(instruction: DecodedInstruction) {
    return this.translator.toHex(instruction);
  }

  downloadRam() {
    const hexInstructions = this.instructions
      .map((i) => this.toHex(i))
      .join(' ');

    // Check if hexInstructions is empty
    if (!hexInstructions) {
      return;
    }

    // Create a Blob with the hex instructions
    const blob = new Blob([`v2.0 raw\n${hexInstructions}`], {
      type: 'text/plain',
    });

    // Create a temporary anchor element to trigger the download
    const anchor = document.createElement('a');
    anchor.download = 'mips_instructions.hex';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();

    window.URL.revokeObjectURL(anchor.href);
  }
}
