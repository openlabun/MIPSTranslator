import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';

export type SelectionMode = 'none' | 'single';

export type ItemClickEvent = {
  sender: ListViewComponent;
  clickedItem: unknown;
};

export type SelectionChangedEvent = {
  sender: ListViewComponent;
  selectedItem: unknown;
};

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css',
})
export class ListViewComponent {
  // Selection
  selectionMode = input<SelectionMode>('single');
  singleSelectionFollowsFocus = input<boolean>(true);
  selectionChanged = output<SelectionChangedEvent>();

  // Click
  isItemClickEnabled = input<boolean>(false);
  itemClick = output<ItemClickEvent>();

  // Items
  itemsSource = input<unknown[]>();
  dataTemplate = input<TemplateRef<unknown>>();

  private clickChild(elm: HTMLElement, item: unknown, updateFocus: boolean) {
    const selected = updateFocus ? this.setFocus(elm, false) : false;

    if (!selected && this.canUpdateSelection('click')) {
      this.select(elm, item);
    }

    if (this.isItemClickEnabled()) {
      this.itemClick.emit({ sender: this, clickedItem: item });
    }
  }

  onItemClick(e: Event, item: unknown) {
    const sender = e.currentTarget as HTMLElement;
    this.clickChild(sender, item, true);
  }

  // Template setup
  private readonly _list =
    viewChild.required<ElementRef<HTMLUListElement>>('root');
  private get root() {
    return this._list().nativeElement;
  }

  private currentFocus: number = -1;
  private currentSelection: number = -1;

  private get focusedElement() {
    if (this.currentFocus != -1) {
      return this.root.children.item(this.currentFocus) as HTMLElement;
    }
    return null;
  }

  private get selectedElement() {
    if (this.currentSelection != -1) {
      return this.root.children.item(this.currentSelection) as HTMLElement;
    }
    return null;
  }

  private canUpdateSelection(currentEvent: 'focus' | 'click') {
    const mode = this.selectionMode();
    if (mode === 'none') {
      return false;
    }

    if (
      currentEvent === 'focus' &&
      mode === 'single' &&
      !this.singleSelectionFollowsFocus()
    ) {
      return false;
    }
    return true;
  }

  private deselect(e: Element) {
    this.currentSelection = -1;
    e.removeAttribute('aria-selected');
  }

  private select(e: Element, item: unknown) {
    const prev = this.selectedElement;
    if (prev) {
      this.deselect(prev);
    }

    this.currentSelection = Number(e.id);
    e.setAttribute('aria-selected', 'true');
    this.selectionChanged.emit({
      sender: this,
      selectedItem: item,
    });
  }

  private removeFocus(e: HTMLElement) {
    this.currentFocus = -1;
    e.classList.remove('focused');
  }

  private setFocus(e: HTMLElement, addFocusVisual: boolean = true): boolean {
    const prev = this.focusedElement;
    if (prev instanceof HTMLElement) {
      this.removeFocus(prev);
    }

    this.currentFocus = Number(e.id);
    if (addFocusVisual) {
      e.classList.add('focused');
    }

    this.root.setAttribute('aria-activedescendant', e.id);
    e.focus();

    if (this.canUpdateSelection('focus')) {
      this.select(e, this.itemsSource()![this.currentFocus]);
      return true;
    }
    return false;
  }

  onListFocused() {
    const elm = this.selectedElement;
    if (elm) {
      this.setFocus(elm);
      return;
    }

    const fc = this.root.firstElementChild;
    if (fc instanceof HTMLLIElement) {
      this.setFocus(fc);
    }
  }

  onListKeyDown(e: KeyboardEvent) {
    const elm = (this.focusedElement ??
      this.root.firstElementChild) as HTMLElement | null;

    if (!elm) {
      return;
    }

    if (!e.repeat && (e.key === 'Enter' || e.key === ' ')) {
      this.clickChild(elm, this.itemsSource()![this.currentFocus], false);
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowUp') {
      const prev = elm.previousElementSibling;
      if (prev instanceof HTMLElement) {
        this.setFocus(prev);
        e.preventDefault();
      }
    } else if (e.key === 'ArrowDown') {
      const next = elm.nextElementSibling;
      if (next instanceof HTMLElement) {
        this.setFocus(next);
        e.preventDefault();
      }
    }
  }
}
