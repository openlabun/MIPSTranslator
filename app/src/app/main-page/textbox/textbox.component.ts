import { Component, inject, output} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';
import { AssistantService } from '../../Shared/Services/Assistant/assistant.service';
//import { AssistantComponent } from './assistant/assistant.component';
import { OnInit ,ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { of, fromEvent,Observable } from "rxjs";
import { debounceTime, map,distinctUntilChanged,switchMap,tap } from "rxjs/operators";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.css'],
})
export class TextboxComponent implements OnInit {
  // Mio
  @ViewChild('completar-instrucciones') instruccionesInput!: ElementRef; 
  @Output() setInstructionEvent = new EventEmitter<{name: String}>();   
  instruccion: any = [];
  showSearches: boolean = false;
  isSearching: boolean = false;
  searchedInstrucciones: any = [];

  
  // No mio
  inputChange = output<string>();
  userInput = inject(FormInputManagerService).inputApp;
  assistantService = inject(AssistantService);
  selectedLineText = output<string>();
  
  constructor() {
    this.instruccion = ['add d, s, t', 'addu d, s, t', 'addi t, s, i', 'addiu t, s, i', 'andi t, s, i', 'div s, t', 'divu s, t', 'beq', 'bne', 'j'];
    this.searchedInstrucciones = this.instruccion;

    this.userInput.valueChanges.subscribe((value: string | null) => {
      if (value !== null) {
        this.inputChange.emit(value); 
      }
    });
  }

  ngOnInit() {
  	this.intruccionSearch();
  }

  getInstruccion(name: string): Observable<any> {
    return of(this.filterInstructions(name))
  }

  filterInstructions(name: string) {
    return this.instruccion.filter((val: string) => val.toLowerCase().includes(name.toLowerCase()));
  }


  intruccionSearch(){
    // Adding keyup Event Listerner on input field
    const search$ = fromEvent(this.instruccionesInput.nativeElement, 'keyup').pipe(
      map((event: any) => event.target.value),
      debounceTime(500),  
      distinctUntilChanged(),
      tap(()=> this.isSearching = true),
      switchMap((term) => term ? this.getInstruccion(term) : of<any>(this.instruccion)),
      tap(() => {
        this.isSearching = false,
        this.showSearches = true;
      }));

      search$.subscribe(data => {
        this.isSearching = false
        this.searchedInstrucciones = data;
      })
  }

  setInstruccionName(name: string) {
    this.searchedInstrucciones = this.filterInstructions(name);
    this.setInstructionEvent.emit({name});
    this.instruccionesInput.nativeElement.value = name;
    this.showSearches = false;
  }

  trackById(index: any,item: { _id: void; }):void{
    return item._id;
  }
  

  onSelect(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const text = textarea.value;

    // Obtener los índices de la selección
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Dividir el texto en líneas
    const lines = text.split('\n');

    let charCount = 0;

    // Iterar por cada línea y encontrar cuál contiene el texto seleccionado
    for (const line of lines) {
      const lineLength = line.length + 1; // +1 por el salto de línea (\n)

      if (
        selectionStart >= charCount && 
        selectionStart < charCount + lineLength
      ) {
        // Verifica si la selección está en una sola línea
        if (selectionEnd <= charCount + lineLength) {
          this.selectedLineText.emit(line);
        } else {
          this.selectedLineText.emit(""); // Selección cruza varias líneas
        }
        break;
      }
      
      charCount += lineLength;
      
    }
    
  }

 
}