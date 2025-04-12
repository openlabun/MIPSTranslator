import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-instrucciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instrucciones.component.html',
  styleUrls: ['./instrucciones.component.css']
})
export class InstruccionesComponent {
  tipos: string[] = ['R', 'I', 'J'];
  tipoSeleccionado: string = '';
  instruccionesSeleccionadas: string[] = [];
  instruccionSeleccionada: string = '';

  @Output() mipsGenerado = new EventEmitter<string>();

  valores = {
    r1: '',
    r2: '',
    r3: ''
  };

  valoresTemporales: Record<string, { r1: string, r2: string, r3: string }> = {};

  mips = '';

  instruccionesPorTipo: Record<string, string[]> = {
    R: [
      "add", "addu", "sub", "subu", "and", "or", "xor", "nor",
      "slt", "sltu", "sll", "srl", "sra", "sllv", "srlv", "srav"
    ],
    I: [
      "addi", "addiu", "andi", "ori", "xori", "slt",
      "beq", "bne",
      "tge", "tgeu", "tlt", "tltu"
    ],
    J: [
      "j", "jal",
      "jr", "jalr"
    ]
  };

  seleccionarTipo(tipo: string) {
    if (this.tipoSeleccionado === tipo) {
      this.tipoSeleccionado = '';
      this.instruccionesSeleccionadas = [];
    } else {
      this.tipoSeleccionado = tipo;
      this.instruccionesSeleccionadas = this.instruccionesPorTipo[tipo];
    }
  }

  seleccionarInstruccion(instruccion: string) {
    this.instruccionSeleccionada = instruccion;

    if (!this.valoresTemporales[instruccion]) {
      this.valoresTemporales[instruccion] = { r1: '', r2: '', r3: '' };
    }
  }

  guardarValores() {
    this.valores = { ...this.valoresTemporales[this.instruccionSeleccionada] };
    if (this.esTipoJ(this.instruccionSeleccionada)) {
      if (this.enteros([this.valores.r1])) {
        this.escribirInstruccion();
        } else {
          this.mipsGenerado.emit('Sintaxis Incorrecta');
        }
    } else {
    if (this.enteros([this.valores.r1, this.valores.r2, this.valores.r3])) {
    this.escribirInstruccion();
    } else {
      this.mipsGenerado.emit('Sintaxis Incorrecta');
    }
  }
  }

  escribirInstruccion() {
    if (this.instruccionesPorTipo['R'].includes(this.instruccionSeleccionada))
    this.mips = `${this.instruccionSeleccionada} $t${this.valores.r1} $t${this.valores.r2} $t${this.valores.r3}`;
    if (this.instruccionesPorTipo['I'].includes(this.instruccionSeleccionada))
      this.mips = `${this.instruccionSeleccionada} $t${this.valores.r1} $t${this.valores.r2} ${this.valores.r3}`;
    if (this.instruccionesPorTipo['J'].includes(this.instruccionSeleccionada))
      this.mips = `${this.instruccionSeleccionada} ${this.valores.r1}`;
    this.mipsGenerado.emit(this.mips);
  }

  esTipoJ(instruccion: string): boolean {
    return this.instruccionesPorTipo['J'].includes(instruccion);
  }
  
  enteros(valores: string[]): boolean {
    return valores.every(val => /^\d+$/.test(val));
  }
}

