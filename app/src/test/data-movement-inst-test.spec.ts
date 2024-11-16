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

    describe('Translate data movement instructions to hex', ()=>{
        it('should translate "mfhi t1" to hex', () => {
            const result = service.translateInstructionToHex('mfhi t1');
            expect(result).toEqual('00004810');
        });
        it('should translate "mflo t1" to hex', () => {
            const result = service.translateInstructionToHex('mflo t1');
            expect(result).toEqual('00004812');
        });
        it('should translate "mthi t1" to hex', () => {
            const result = service.translateInstructionToHex('mthi t1');
            expect(result).toEqual('01200011');
        });
        it('should translate "mtlo t1" to hex', () => {
            const result = service.translateInstructionToHex('mtlo t1');
            expect(result).toEqual('01200013');
        });
    });
    describe('Translate hex to data movement', ()=>{
        it('should translate "00004810" to mips', () => {
            const result = service.translateInstructionToMIPS('00004810');
            expect(result).toEqual('mfhi $t1');
        });
        it('should translate "00004812" to mips', () => {
            const result = service.translateInstructionToMIPS('00004812');
            expect(result).toEqual('mflo $t1');
        });
        it('should translate "00004810" to mips', () => {
            const result = service.translateInstructionToMIPS('01200011');
            expect(result).toEqual('mthi $t1');
        });
        it('should translate "01200013" to mips', () => {
            const result = service.translateInstructionToMIPS('01200013');
            expect(result).toEqual('mtlo $t1');
        });
    });
});