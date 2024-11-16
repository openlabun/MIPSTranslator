import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService jump instruction tests', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });

    describe('Translate jump instructions to hex', () => {
        it('should translate "j 1024" to hex', () => {
            const result = service.translateInstructionToHex('j 1024');
            expect(result).toEqual('08000400');
        });
        it('should translate "jal 2048" to hex', () => {
            const result = service.translateInstructionToHex('jal 2048');
            expect(result).toEqual('0C000800');
        });
        it('should translate "jalr t1" to hex', () => {
            const result = service.translateInstructionToHex('jalr t1');
            expect(result).toEqual('0120F809');
        });
        it('should translate "jr t1" to hex', () => {
            const result = service.translateInstructionToHex('jr t1');
            expect(result).toEqual('01200008');
        });
    });

    describe('Translate hex to jump instructions', () => {
        it('should translate "08000400" to mips', () => {
            const result = service.translateInstructionToMIPS('08000400');
            expect(result).toEqual('j 0x0000400');
        });

        it('should translate "0C000800" to mips', () => {
            const result = service.translateInstructionToMIPS('0C000800');
            expect(result).toEqual('jal 0x0000800');
        });
        it('should translate "0120F809" to mips', () => {
            const result = service.translateInstructionToMIPS('0120F809');
            expect(result).toEqual('jalr $t1 $ra');
        });
        it('should translate "01200008" to mips', () => {
            const result = service.translateInstructionToMIPS('01200008');
            expect(result).toEqual('jr $t1');
        });
    });
});
