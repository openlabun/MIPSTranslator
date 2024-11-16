import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService comparison instruction tests', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });
    describe('Translate comparison isntructions to hex', () => {
        it('should translate "slt $s1, $s2, $s3" to hex', () => {
            const result = service.translateInstructionToHex('slt $s1 $s2 $s3');
            expect(result).toEqual('0253882A');
        });
    });
    describe('Translate hex to comparison isntructions', () => {
        it('should translate "0253882A" to mips', () => {
            const result = service.translateInstructionToMIPS('0253882A');
            expect(result).toEqual('slt $s1 $s2 $s3');
        });
    });
});
