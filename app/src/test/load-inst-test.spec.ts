import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService I-type instruction tests', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });

    describe('Translate load instructions to hex', ()=>{
        it('should translate "lw $t0, 32 $t1" to hex', () => {
            const result = service.translateInstructionToHex('lw $t0 32 $t1');
            expect(result).toEqual('8D280020');
        });
        it('should translate "lb t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('lb t0 4 t1');
            expect(result).toEqual('81280004');
        });
        it('should translate "lbu t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('lbu t0 4 t1');
            expect(result).toEqual('91280004');
        });
        it('should translate "lh t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('lh t0 4 t1');
            expect(result).toEqual('85280004');
        });
        it('should translate "lhu t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('lhu t0 4 t1');
            expect(result).toEqual('95280004');
        });
    })
    describe('Translate hex to load instructions', ()=>{
        it('should translate "8D280020" to mips', () => {
            const result = service.translateInstructionToMIPS('8D280020');
            expect(result).toEqual('lw $t0 0x0020 $t1');
        });
        it('should translate "81280004" to mips', () => {
            const result = service.translateInstructionToMIPS('81280004');
            expect(result).toEqual('lb $t0 0x0004 $t1');
        });
        it('should translate "91280004" to mips', () => {
            const result = service.translateInstructionToMIPS('91280004');
            expect(result).toEqual('lbu $t0 0x0004 $t1');
        });
        it('should translate "85280004" to mips', () => {
            const result = service.translateInstructionToMIPS('85280004');
            expect(result).toEqual('lh $t0 0x0004 $t1');
        });
        it('should translate "95280004" to mips', () => {
            const result = service.translateInstructionToMIPS('95280004');
            expect(result).toEqual('lhu $t0 0x0004 $t1');
        });
    })
});
