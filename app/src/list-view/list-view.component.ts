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

type SetFocusOptions = {
  addFocusVisual?: boolean;
  scrollIntoView?: boolean;
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

  private scrollIntoView(e: HTMLElement) {
    const scrollBottom = this.root.clientHeight + this.root.scrollTop;
    const elementBottom = e.offsetTop + e.offsetHeight;

    if (elementBottom > scrollBottom) {
      this.root.scrollTop = elementBottom - this.root.clientHeight;
    } else if (e.offsetTop < this.root.scrollTop) {
      this.root.scrollTop = e.offsetTop;
    }

    e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  private clickChild(elm: HTMLElement, item: unknown, updateFocus: boolean) {
    const selected = updateFocus
      ? this.setFocus(elm, { addFocusVisual: false })
      : false;

    if (!selected && this.canUpdateSelection('click')) {
      this.select(elm, item);
    }

    if (this.isItemClickEnabled()) {
      this.itemClick.emit({ sender: this, clickedItem: item });
    }
  }

  onListClick(e: Event) {
    // TypeScript won't accept the target as an HTMLElement below the attribute check
    // unless this cast is added
    let item = e.target as HTMLElement | null;

    if (item instanceof HTMLElement) {
      if (item.getAttribute('role') !== 'option') {
        item = item.closest<HTMLElement>('[role="option"]');
      }

      if (item) {
        this.clickChild(item, this.itemsSource()![Number(item.id)], true);
      }
    }
  }

  // Template setup
  private readonly _list = viewChild.required<ElementRef<HTMLElement>>('root');
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

  private get firstChild() {
    return this.root.firstElementChild as HTMLElement | null;
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

  private deselect(elm: Element) {
    this.currentSelection = -1;
    elm.removeAttribute('aria-selected');
  }

  private select(elm: Element, item: unknown) {
    const prev = this.selectedElement;
    if (prev) {
      this.deselect(prev);
    }

    this.currentSelection = Number(elm.id);
    elm.setAttribute('aria-selected', 'true');
    this.selectionChanged.emit({
      sender: this,
      selectedItem: item,
    });
  }

  private removeFocus(elm: HTMLElement) {
    this.currentFocus = -1;
    elm.classList.remove('focused');
  }

  private setFocus(elm: HTMLElement, options?: SetFocusOptions): boolean {
    const prev = this.focusedElement;
    if (prev instanceof HTMLElement) {
      this.removeFocus(prev);
    }

    this.currentFocus = Number(elm.id);
    if (options?.addFocusVisual ?? true) {
      elm.classList.add('focused');
    }

    this.root.setAttribute('aria-activedescendant', elm.id);
    if (options?.scrollIntoView ?? true) {
      this.scrollIntoView(elm);
    }

    if (this.canUpdateSelection('focus')) {
      this.select(elm, this.itemsSource()![this.currentFocus]);
      return true;
    }
    return false;
  }

  onListFocus() {
    const elm = this.selectedElement ?? this.root.firstElementChild;
    if (elm instanceof HTMLElement) {
      this.setFocus(elm, { scrollIntoView: false });
    }
  }

  onListKeyDown(e: KeyboardEvent, ignoreIfNoneFocused: boolean = false) {
    const elm =
      this.focusedElement ?? (ignoreIfNoneFocused ? null : this.firstChild);

    if (!elm) {
      return;
    }

    if (!e.repeat && (e.key === 'Enter' || e.key === ' ')) {
      this.clickChild(elm, this.itemsSource()![this.currentFocus], false);
      e.preventDefault();
      return;
    }

    let keyMovesFocus = true;
    let moveFocusTo: Element | null = null;

    if (e.key === 'ArrowUp') {
      moveFocusTo = elm.previousElementSibling;
    } else if (e.key === 'ArrowDown') {
      moveFocusTo = elm.nextElementSibling;
    } else {
      keyMovesFocus = false;
    }

    if (moveFocusTo instanceof HTMLElement) {
      this.setFocus(moveFocusTo);
      e.preventDefault();
    } else if (keyMovesFocus) {
      this.scrollIntoView(elm);
      e.preventDefault();
    }
  }
}
