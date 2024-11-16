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

    describe('Translate store instructions to hex', ()=>{
        it('should translate "sw t1 0 t2" to hex', () => {
            const result = service.translateInstructionToHex('sw t1 0 t2');
            expect(result).toEqual('AD490000');
        });
        it('should translate "sb t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('sb t0 4 t1');
            expect(result).toEqual('A1280004');
        });
        it('should translate "sh t0 4 t1" to hex', () => {
            const result = service.translateInstructionToHex('sh t0 4 t1');
            expect(result).toEqual('A5280004');
        });
    });
    describe('Translate hex to store instructions', ()=>{
        it('should translate "AD490000" to mips', () => {
            const result = service.translateInstructionToMIPS('AD490000');
            expect(result).toEqual('sw $t1 0x0000 $t2');
        });
        it('should translate "A1280004" to mips', () => {
            const result = service.translateInstructionToMIPS('A1280004');
            expect(result).toEqual('sb $t0 0x0004 $t1');
        });
        it('should translate "A5280004" to mips', () => {
            const result = service.translateInstructionToMIPS('A5280004');
            expect(result).toEqual('sh $t0 0x0004 $t1');
        });
    });
});
