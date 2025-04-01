import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ItemClickEvent,
  ListViewComponent,
} from '../list-view/list-view.component';

export type QuerySubmittedEvent = {
  sender: AutoSuggestBoxComponent;
  chosenSuggestion?: string;
  queryText: string;
};

@Component({
  selector: 'app-auto-suggest-box',
  standalone: true,
  imports: [CommonModule, FormsModule, ListViewComponent],
  templateUrl: './auto-suggest-box.component.html',
  styleUrl: './auto-suggest-box.component.css',
})
export class AutoSuggestBoxComponent {
  private focused: boolean = false;

  suggestions = input.required<string[]>();
  text = model<string>('');

  show = false;
  querySubmitted = output<QuerySubmittedEvent>();

  constructor() {
    this.text.subscribe(() => this.onTextUpdated());
  }

  private readonly _inputBox =
    viewChild.required<ElementRef<HTMLInputElement>>('inputBox');
  protected get inputBox() {
    return this._inputBox().nativeElement;
  }

  private readonly _flyout =
    viewChild.required<ElementRef<HTMLDivElement>>('suggestionFlyout');
  protected get suggestionFlyout() {
    return this._flyout().nativeElement;
  }

  private readonly _list =
    viewChild.required<ListViewComponent>('suggestionList');
  protected get suggestionList() {
    return this._list();
  }

  onTextUpdated() {
    if (this.focused) {
      this.show = true;
    }
  }

  onInputFocus() {
    this.focused = true;
  }

  onInputFocusLost(e: FocusEvent) {
    this.focused = false;
    const newFocus = e.relatedTarget;
    if (
      newFocus instanceof HTMLElement &&
      newFocus.parentElement?.parentElement === this.suggestionFlyout
    ) {
      return;
    }
    this.show = false;
  }

  onSuggestionPicked(e: ItemClickEvent) {
    this.querySubmitted.emit({
      sender: this,
      chosenSuggestion: e.clickedItem as string,
      queryText: this.text(),
    });
  }

  onInputKeyDown(e: KeyboardEvent) {
    // Removes the flyout from tab order before it's gone due to focus loss
    if (e.key === 'Escape' || e.key === 'Tab') {
      this.show = false;
      return;
    }

    if (e.key === ' ') {
      return;
    }

    // If Enter is pressed and no suggestion is focused, we don't want to pick a
    // suggestion
    this.suggestionList.onListKeyDown(e, e.key === 'Enter');
    if (e.defaultPrevented) {
      return;
    }

    if (!e.repeat && e.key === 'Enter') {
      this.querySubmitted.emit({
        sender: this,
        queryText: this.text(),
      });
      e.preventDefault();
      return;
    }
  }
}
