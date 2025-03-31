import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import {
  getRequiredFunctArguments,
  getRequiredImmArguments,
  ValidArgument,
} from '../Shared/lib/mips/args';
import { FunctionCode } from '../Shared/lib/mips/funct';
import {
  DecodedInstruction,
  ImmediateInstruction,
  isImm,
  isJump,
  isReg,
  JumpInstruction,
  RegisterInstruction,
} from '../Shared/lib/mips/instruction';
import { KnownInstructionOpcode } from '../Shared/lib/mips/op';
import { ListViewComponent } from '../list-view/list-view.component';

type InputStatus = 'unset' | 'valid' | 'invalid';

type BitRange = {
  start: number;
  size: number;
};

type PartInformation = {
  name: string;
  required: boolean;
  bitRange: BitRange;
  value: number;
};

function range(start: number, size: number): BitRange {
  return { start, size };
}

@Component({
  selector: 'app-mips-detail',
  standalone: true,
  imports: [ListViewComponent],
  templateUrl: './mips-detail.component.html',
  styleUrl: './mips-detail.component.css',
})
export class MipsDetailComponent implements OnChanges {
  instruction = input<DecodedInstruction>();
  status: InputStatus = 'unset';

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['instruction'];
    if (!change) {
      return;
    }

    const inst = change.currentValue as DecodedInstruction;
    if (!inst) {
      this.status = 'unset';
      return;
    }

    if (isReg(inst) || isImm(inst) || isJump(inst)) {
      this.status = 'valid';
    } else {
      this.status = 'invalid';
    }
  }

  // Convenience methods to display information
  title(inst: DecodedInstruction): string {
    const op = inst.op;
    const str = KnownInstructionOpcode[op];

    if (op === KnownInstructionOpcode.REG) {
      return `${FunctionCode[inst.funct]} (${str})`;
    }
    return `${str} (${isImm(inst) ? 'IMM' : 'JUMP'})`;
  }

  private static readonly regKeys: ValidArgument<'reg'>[] = [
    'rs',
    'rt',
    'rd',
    'shamt',
  ];

  private static getRegStructure(inst: RegisterInstruction) {
    const args = getRequiredFunctArguments(inst.funct);
    let start = 6;

    const kvps: PartInformation[] = [
      { name: 'op', required: true, bitRange: range(0, 6), value: inst.op },
    ];

    for (const arg of this.regKeys) {
      kvps.push({
        name: arg,
        required: args.includes(arg),
        bitRange: range(start, 5),
        value: inst[arg],
      });
      start += 5;
    }

    kvps.push({
      name: 'funct',
      required: true,
      bitRange: range(start, 6),
      value: inst.funct,
    });
    return kvps;
  }

  private static readonly immKeys: ValidArgument<'imm'>[] = ['rs', 'rt', 'imm'];

  private static getImmStructure(inst: ImmediateInstruction) {
    const args = getRequiredImmArguments(inst.op);
    let start = 6;

    const kvps: PartInformation[] = [
      { name: 'op', required: true, bitRange: range(0, 6), value: inst.op },
    ];

    for (const arg of this.immKeys) {
      const size = arg === 'imm' ? 16 : 5;
      kvps.push({
        name: arg,
        required: args.includes(arg),
        bitRange: range(start, size),
        value: inst[arg],
      });
      start += size;
    }
    return kvps;
  }

  private static getJumpStructure(inst: JumpInstruction): PartInformation[] {
    return [
      { name: 'op', required: true, bitRange: range(0, 6), value: inst.op },
      { name: 'imm', required: true, bitRange: range(6, 26), value: inst.imm },
    ];
  }

  structureEntries(inst: DecodedInstruction) {
    if (isReg(inst)) {
      return MipsDetailComponent.getRegStructure(inst);
    } else if (isImm(inst)) {
      return MipsDetailComponent.getImmStructure(inst);
    } else if (isJump(inst)) {
      return MipsDetailComponent.getJumpStructure(inst);
    }

    throw new TypeError('The provided instruction is not valid');
  }

  getRangeSpan(range: BitRange) {
    return `${range.start + 1} / span ${range.size}`;
  }

  toBinary(num: number, size: number) {
    return num.toString(2).padStart(size, '0');
  }
}
