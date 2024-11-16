import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService', () => {
    let service: TranslatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslatorService]
        });
        service = TestBed.inject(TranslatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('it must accept 0x hex instructions', () => {
        it('should translate "0x1920009F" to mips', () => {
            const result = service.translateInstructionToMIPS('0x1920009F');
            expect(result).toEqual('blez $t1 0x009F');
        });
    })
});
