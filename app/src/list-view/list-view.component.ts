import { CommonModule } from '@angular/common';
import {
  Component,
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

  onItemClick(e: Event, item: unknown) {
    if (this.canUpdateSelection('click')) {
      this.select(e.currentTarget as HTMLElement, item);
    }

    if (this.isItemClickEnabled()) {
      this.itemClick.emit({ sender: this, clickedItem: item });
    }
  }

  // Template setup
  private readonly _list = viewChild.required<HTMLUListElement>('root');
  private currentFocus: string = '';
  private currentSelection: string = '';

  private scrollIntoView(e: HTMLElement) {
    const scrollBottom = this._list().clientHeight + this._list().scrollTop;
    const elementBottom = e.offsetTop + e.offsetHeight;

    if (elementBottom > scrollBottom) {
      this._list().scrollTop = elementBottom - this._list().clientHeight;
    } else if (e.offsetTop < this._list().scrollTop) {
      this._list().scrollTop = e.offsetTop;
    }

    e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
    e.removeAttribute('aria-selected');
  }

  private select(e: Element, item: unknown) {
    const prev = this.getSelectedElement();
    if (prev) {
      this.deselect(prev);
    }

    this.currentSelection = e.id;
    e.setAttribute('aria-selected', 'true');
    this.selectionChanged.emit({
      sender: this,
      selectedItem: item,
    });
  }

  private getFocusedElement() {
    if (this.currentFocus) {
      return document.getElementById(this.currentFocus);
    }
    return null;
  }

  private getSelectedElement() {
    if (this.currentSelection) {
      return document.getElementById(this.currentSelection);
    }
    return null;
  }

  private removeFocus(e: HTMLElement) {
    e.classList.remove('focused');
  }

  private setFocus(e: HTMLElement) {
    const prev = this.getFocusedElement();
    if (prev) {
      this.removeFocus(prev);
    }

    this.currentFocus = e.id;
    e.classList.add('focused');
    this.scrollIntoView(e);

    if (this.canUpdateSelection('focus')) {
      this.select(e, this.itemsSource()![Number(e.id)]);
    }
  }

  onListFocused(e: FocusEvent) {
    const elm = e.currentTarget as HTMLUListElement;
    const fc = elm.firstElementChild;

    if (fc instanceof HTMLLIElement) {
      this.setFocus(fc);
    }
  }

  onListKeyDown(e: KeyboardEvent) {
    const parent = e.currentTarget as HTMLUListElement;
    const elm = (this.getFocusedElement() ??
      parent.firstElementChild) as HTMLElement | null;

    if (!elm) {
      return;
    }

    if (!e.repeat && (e.key === 'Enter' || e.key === ' ')) {
      elm.click();
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
