import { Component, inject, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputManagerService } from '../../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../../Shared/Services/tableInstruction/table-instruction.service';
import { AssistantService } from '../../Shared/Services/Assistant/assistant.service';
//import { AssistantComponent } from './assistant/assistant.component';
import { OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { of, fromEvent, Observable } from "rxjs";
import { debounceTime, map, distinctUntilChanged, switchMap, tap } from "rxjs/operators";
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
  @Output() setInstructionEvent = new EventEmitter<{ name: String }>();
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
    this.instruccion = ['add t1 t2 t3', 'add t0 t1 t2', 'add s1 s2 s3', 'addu t1 t2 t3', 'addu t0 t1 t2', 'addu s1 s2 s3', 'addi t1 t2 10', 'addi t0 t1 5', 'addi s1 s2 15', 'addiu t1 t2 10', 'addiu t0 t1 5', 'addiu s1 s2 15', 'and t1 t2 t3', 'and t0 t1 t2', 'and s1 s2 s3', 'andi t1 t2 10', 'andi t0 t1 5',
      'andi s1 s2 15', 'div t1 t2', 'div t0 t1', 'div s1 s2', 'divu t1 t2', 'divu t0 t1', 'divu s1 s2', 'mult t1 t2', 'mult t0 t1', 'mult s1 s2', 'multu t1 t2', 'multu t0 t1', 'multu s1 s2', 'nor t1 t2 t3', 'nor t0 t1 t2', 'nor s1 s2 s3', 'or t1 t2 t3', 'or t0 t1 t2', 'or s1 s2 s3', 'sll t1 t2 2', 'sll t0 t1 4', 'sll s1 s2 3', 'sllv t1 t2 t3', 'sllv t0 t1 t2', 'sllv s1 s2 s3', 'sra t1 t2 2', 'sra t0 t1 3', 'sra s1 s2 4',
      'add t1 t2 t3', 'add t0 t1 t2', 'add s1 s2 s3', 'srav t1 t2 t3', 'srav t0 t1 t2', 'srav s1 s2 s3', 'srl t1 t2 2', 'srl t0 t1 3', 'srl s1 s2 4', 'srlv t1 t2 t3', 'srlv t0 t1 t2', 'srlv s1 s2 s3', 'sub t1 t2 t3', 'sub t0 t1 t2', 'sub s1 s2 s3', 'subu t1 t2 t3', 'subu t0 t1 t2', 'subu s1 s2 s3', 'xor t1 t2 t3', 'xor t0 t1 t2', 'xor s1 s2 s3', 'xori t1 t2 10', 'xori t0 t1 5', 'xori s1 s2 15', 'lb t1 0(t2)', 'lb t0 4(t1)', 'lb s1 8(s2)', 'lbu t1 0(t2)', 'lbu t0 4(t1)', 'lbu s1 8(s2)', 'lh t1 0(t2)', 'lh t0 4(t1)', 'lh s1 8(s2)', 'lhu t1 0(t2)', 'lhu t0 4(t1)', 'lhu s1 8(s2)', 'lw t1 0(t2)', 'lw t0 4(t1)', 'lw s1 8(s2)', 'sb t1 0(t2)', 'sb t0 4(t1)', 'sb s1 8(s2)', 'sh t1 0(t2)', 'sh t0 4(t1)', 'sh s1 8(s2)', 'sw t1 0(t2)', 'sw t0 4(t1)', 'sw s1 8(s2)', 'mfhi t1', 'mfhi t0', 'mfhi s1', 'mflo t1', 'mflo t0', 'mflo s1', 'mthi t1', 'mthi t0', 'mthi s1', 'mtlo t1', 'mtlo t0', 'mtlo s1', 'slt t1 t2 t3', 'slt t0 t1 t2', 'slt s1 s2 s3', 'sltu t1 t2 t3', 'sltu t0 t1 t2', 'sltu s1 s2 s3', 'slti t1 t2 10', 'slti t0 t1 5', 'slti s1 s2 15', 'sltiu t1 t2 10', 'sltiu t0 t1 5', 'sltiu s1 s2 15', 'beq t1 t2 etiqueta', 'beq t0 t1 etiqueta', 'beq s1 s2 etiqueta', 'bgtz t1 etiqueta', 'bgtz t0 etiqueta', 'bgtz s1 etiqueta', 'blez t1 etiqueta', 'blez t0 etiqueta', 'blez s1 etiqueta', 'bne t1 t2 etiqueta', 'bne t0 t1 etiqueta', 'bne s1 s2 etiqueta', 'j etiqueta1', 'j etiqueta2', 'j etiqueta3', 'jal etiqueta1', 'jal etiqueta2', 'jal etiqueta3', 'jr ra', 'jr t1', 'jr s1', 'jalr t1', 'jalr t0', 'jalr s1', 'trap 1', 'trap 5', 'trap 10'
    ];
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


  intruccionSearch() {
    // Adding keyup Event Listerner on input field
    const search$ = fromEvent(this.instruccionesInput.nativeElement, 'keyup').pipe(
      map((event: any) => event.target.value),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.isSearching = true),
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
    this.setInstructionEvent.emit({ name });
    this.instruccionesInput.nativeElement.value = name;
    this.showSearches = false;
  }

  trackById(index: any, item: { _id: void; }): void {
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