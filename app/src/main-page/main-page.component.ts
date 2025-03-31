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

  readonly instructions: Partial<DecodedInstruction>[] = [];
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

  toAsm(instruction: Partial<DecodedInstruction>) {
    return this.translator.toAsm(instruction as DecodedInstruction);
  }

  toHex(instruction: Partial<DecodedInstruction>) {
    return this.translator.toHex(instruction as DecodedInstruction);
  }
}
