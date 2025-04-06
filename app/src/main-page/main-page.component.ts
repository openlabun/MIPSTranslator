import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  inject,
  model,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  AutoSuggestBoxComponent,
  QuerySubmittedEvent,
} from '../auto-suggest-box/auto-suggest-box.component';
import { ContributorsComponent } from '../contributors/contributors.component';
import {
  ListViewComponent,
  SelectionChangedEvent,
} from '../list-view/list-view.component';
import { MipsDetailComponent } from '../mips-detail/mips-detail.component';
import { DecodedInstruction } from '../Shared/lib/mips/instruction';
import { AssistantService } from '../Shared/Services/Assistant/assistant.service';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  const dt = e.dataTransfer;

  if (!dt) return;

  if (dt.items.length === 1 && dt.items[0].kind === 'file') {
    dt.dropEffect = 'copy';
    document.body.toggleAttribute('drag', true);
  } else {
    dt.dropEffect = 'none';
  }
}

function onDragLeave() {
  document.body.toggleAttribute('drag', false);
}

type DecodeSuccess = {
  success: true;
  result: {
    decoded: DecodedInstruction[];
    unsupported: string[];
  };
};

type DecodeFailure = {
  success: false;
  error: string;
};

type DecodeResult = DecodeSuccess | DecodeFailure;

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    AutoSuggestBoxComponent,
    ContributorsComponent,
    ListViewComponent,
    MipsDetailComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent {
  private readonly assistant = inject(AssistantService);
  private readonly translator = inject(TranslatorService);
  private readonly dropHandler = this.onDrop.bind(this);

  readonly instructions: DecodedInstruction[] = [];
  readonly suggestions: string[] = [];

  textInput = model<string>('');
  selected: DecodedInstruction | undefined = undefined;
  showFooter = false;

  constructor(private readonly changes: ChangeDetectorRef) {
    afterNextRender(() => {
      document.addEventListener('dragover', onDragEnter);
      document.addEventListener('dragleave', onDragLeave);
      document.addEventListener('drop', this.dropHandler);
    });
  }

  toggleFooter(): void {
    this.showFooter = !this.showFooter;
  }

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

    const parsed = this.translator.tryParse(e.queryText);

    if (parsed.stage === 'complete') {
      this.textInput.set('');
      this.instructions.push(parsed.instruction);
      this.selected = parsed.instruction;
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

    if (!hexInstructions) return;

    const blob = new Blob([`v2.0 raw\n${hexInstructions}`], {
      type: 'text/plain',
    });

    const anchor = document.createElement('a');
    anchor.download = 'mips_instructions.hex';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();

    window.URL.revokeObjectURL(anchor.href);
  }

  private decodeRam(file: File) {
    return new Promise<DecodeResult>((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        const lines = fileContent.trim().split('\n');

        if (lines.length < 2) {
          resolve({
            success: false,
            error: 'Invalid file format. Expected at least two lines.',
          });
          return;
        }

        const instructions = lines[1].trim().split(/\s+/);
        const decoded = [];
        const unsupported = [];

        for (const inst of instructions) {
          const parsed = this.translator.tryParse(inst);

          if (parsed.stage === 'complete') {
            decoded.push(parsed.instruction);
          } else {
            unsupported.push(inst);
          }
        }

        resolve({ success: true, result: { decoded, unsupported } });
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Unable to read file.',
        });
      };

      reader.readAsText(file);
    });
  }

  private async handleRamUpload(file: File) {
    const decode = await this.decodeRam(file);

    if (decode.success) {
      this.instructions.splice(0, this.instructions.length);
      this.instructions.push(...decode.result.decoded);

      if (decode.result.decoded.length > 0) {
        this.selected = decode.result.decoded[0];
      }

      if (decode.result.unsupported.length > 0) {
        alert(
          `The following instructions couldn't be decoded: "${decode.result.unsupported.join(
            '", "'
          )}"`
        );
      }
    } else {
      alert(`Unable to load RAM: ${decode.error}`);
    }
  }

  private async onDrop(e: DragEvent) {
    e.preventDefault();
    document.body.toggleAttribute('drag', false);
    const item = e.dataTransfer?.items[0];

    if (item?.kind === 'file') {
      await this.handleRamUpload(item.getAsFile()!);
      this.changes.detectChanges();
    }
  }

  async onRamUpload(e: Event) {
    e.preventDefault();
    const inputEvent = e.target as HTMLInputElement;
    const file = inputEvent.files?.item(0);

    if (file) {
      await this.handleRamUpload(file);
    }
  }

  clearAllInstructions(): void {
    if (this.instructions.length === 0) return;

    if (
      !confirm(
        '⚠️ Are you sure you want to clear all instructions?\nThis action cannot be undone.'
      )
    ) {
      return;
    }

    this.instructions.splice(0, this.instructions.length);
    this.selected = undefined;
    this.suggestions.splice(0, this.suggestions.length);
    this.textInput.set('');
    this.changes.detectChanges();
  }
}
