import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService R-type instruction tests', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });

    describe('Translate R-trap instructions to hex', ()=>{
        it('should translate "teq t0 t1" to hex', () => {
            const result = service.translateInstructionToHex('teq t0 t1');
            expect(result).toEqual('01090034');
        });
        it('should translate "tge t0 t1" to hex', () => {
            const result = service.translateInstructionToHex('tge t0 t1');
            expect(result).toEqual('01090030');
        });
        it('should translate "tgeu t0 t1" to hex', () => {
            const result = service.translateInstructionToHex('tgeu t0 t1');
            expect(result).toEqual('01090031');
        });
        it('should translate "tlt t0 t1" to hex', () => {
            const result = service.translateInstructionToHex('tlt t0 t1');
            expect(result).toEqual('01090032');
        });
        it('should translate "tltu t0 t1" to hex', () => {
            const result = service.translateInstructionToHex('tltu t0 t1');
            expect(result).toEqual('01090033');
        });
        it('should translate "tne t0 t1" to hex', () => {
            const result = service.translateInstructionToHex('tne t0 t1');
            expect(result).toEqual('01090036');
        });
    });
    describe('Translate hex to R-trap instructions', ()=>{
        it('should translate "01090004" to mips', () => {
            const result = service.translateInstructionToMIPS('01090034');
            expect(result).toEqual('teq $t0 $t1');
        });
        it('should translate "01090000" to mips', () => {
            const result = service.translateInstructionToMIPS('01090030');
            expect(result).toEqual('tge $t0 $t1');
        });
        it('should translate "01090001" to mips', () => {
            const result = service.translateInstructionToMIPS('01090031');
            expect(result).toEqual('tgeu $t0 $t1');
        });
        it('should translate "01090002" to mips', () => {
            const result = service.translateInstructionToMIPS('01090032');
            expect(result).toEqual('tlt $t0 $t1');
        });
        it('should translate "01090003" to mips', () => {
            const result = service.translateInstructionToMIPS('01090033');
            expect(result).toEqual('tltu $t0 $t1');
        });
        it('should translate "01090006" to mips', () => {
            const result = service.translateInstructionToMIPS('01090036');
            expect(result).toEqual('tne $t0 $t1');
        });
    });
});
