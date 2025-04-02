import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  input,
  model,
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

type ChangeSource = 'click' | 'focus' | 'selection';
type SetFocusOptions = {
  addFocusVisual?: boolean;
  scrollIntoView?: boolean;
  sourceEvent?: ChangeSource;
};

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css',
})
export class ListViewComponent {
  private currentFocus: number = -1;

  // Selection
  readonly selectionMode = input<SelectionMode>('single');
  readonly singleSelectionFollowsFocus = input<boolean>(true);
  readonly selectedIndex = model<number>(-1);
  readonly selectionChanged = output<SelectionChangedEvent>();

  // Click
  readonly isItemClickEnabled = input<boolean>(false);
  readonly itemClick = output<ItemClickEvent>();

  // Items
  readonly itemsSource = input.required<unknown[]>();
  readonly dataTemplate = input<TemplateRef<unknown>>();

  constructor() {
    this.selectedIndex.subscribe(this.onSelectedIndexChanged.bind(this));
  }

  private onSelectedIndexChanged(value: number) {
    const items = this.itemsSource();
    if (value >= items.length || value < -1) {
      throw new RangeError('The provided index is not valid.');
    }

    const prev = this.root.querySelector<HTMLElement>(':scope>[aria-selected]');
    if (prev) {
      prev.removeAttribute('aria-selected');
    }

    if (value !== -1) {
      const elm = this.selectedContainer!;
      this.moveFocusTo(value, { sourceEvent: 'selection' });
      elm.setAttribute('aria-selected', 'true');

      this.selectionChanged.emit({
        sender: this,
        selectedItem: items[value],
      });
    } else {
      const focus = this.focusedContainer;
      if (focus) {
        this.removeFocus(focus);
      }

      this.selectionChanged.emit({
        sender: this,
        selectedItem: null,
      });
    }
  }

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

  private clickChild(elm: HTMLElement, item: unknown) {
    this.moveFocusTo(Number(elm.id), {
      addFocusVisual: false,
      sourceEvent: 'click',
    });

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
        this.clickChild(item, this.itemsSource()![Number(item.id)]);
      }
    }
  }

  // Template setup
  private readonly _list = viewChild.required<ElementRef<HTMLElement>>('root');
  private get root() {
    return this._list().nativeElement;
  }

  private get focusedContainer() {
    return this.root.children.item(this.currentFocus) as HTMLElement | null;
  }

  private get selectedContainer() {
    return this.root.children.item(this.selectedIndex()) as HTMLElement | null;
  }

  private get firstContainer() {
    return this.root.firstElementChild as HTMLElement | null;
  }

  private canUpdateSelection(on: ChangeSource) {
    if (on === 'selection') {
      return false;
    }

    const mode = this.selectionMode();
    if (mode === 'none') {
      return false;
    }

    if (
      on === 'focus' &&
      mode === 'single' &&
      !this.singleSelectionFollowsFocus()
    ) {
      return false;
    }
    return true;
  }

  private select(elm: Element) {
    this.selectedIndex.set(Number(elm.id));
  }

  private removeFocus(elm: HTMLElement) {
    this.currentFocus = -1;
    this.root.removeAttribute('aria-activedescendant');
    elm.classList.remove('focused');
  }

  private moveFocusTo(index: number, options?: SetFocusOptions): boolean {
    if (index !== this.currentFocus) {
      this.focusedContainer?.classList.remove('focused');
      this.currentFocus = index;
      this.root.setAttribute('aria-activedescendant', String(index));
    }

    const to = this.focusedContainer;
    if (to) {
      if (options?.addFocusVisual ?? true) {
        to.classList.add('focused');
      }
      if (options?.scrollIntoView ?? true) {
        this.scrollIntoView(to);
      }

      if (this.canUpdateSelection(options?.sourceEvent ?? 'focus')) {
        this.select(to);
        return true;
      }
    }

    return false;
  }

  onListFocus() {
    let i = this.selectedIndex();
    if (i === -1 && this.itemsSource().length !== 0) {
      i = 0;
    }

    if (i !== -1) {
      this.moveFocusTo(0, { scrollIntoView: false });
    }
  }

  onListKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!e.repeat) {
        const item = this.focusedContainer;
        if (item) {
          this.clickChild(item, this.itemsSource()![this.currentFocus]);
          e.preventDefault();
        }
      }
      return;
    }

    const elm = this.focusedContainer ?? this.firstContainer;
    if (!elm) {
      return;
    }

    let keyMovesFocus = true;
    let newFocus = this.currentFocus;

    if (e.key === 'ArrowUp') {
      newFocus--;
    } else if (e.key === 'ArrowDown') {
      newFocus++;
    } else {
      keyMovesFocus = false;
    }

    if (keyMovesFocus) {
      e.preventDefault();

      if (newFocus >= 0 && newFocus < this.itemsSource().length) {
        this.moveFocusTo(newFocus);
      } else {
        this.scrollIntoView(elm);
      }
    }
  }
}
