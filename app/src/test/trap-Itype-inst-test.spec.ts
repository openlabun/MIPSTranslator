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

    describe('Translate I-trap instructions to hex', ()=>{
        it('should translate "teqi t0 10" to hex', () => {
            const result = service.translateInstructionToHex('teqi t0 10');
            expect(result).toEqual('050C000A');
        });
        it('should translate "tgei t0 10" to hex', () => {
            const result = service.translateInstructionToHex('tgei t0 10');
            expect(result).toEqual('0508000A');
        });
        it('should translate "tgeiu t0 10" to hex', () => {
            const result = service.translateInstructionToHex('tgeiu t0 10');
            expect(result).toEqual('0509000A');
        });
        it('should translate "tlti t0 10" to hex', () => {
            const result = service.translateInstructionToHex('tlti t0 10');
            expect(result).toEqual('050A000A');
        });
        it('should translate "tltiu t0 10" to hex', () => {
            const result = service.translateInstructionToHex('tltiu t0 10');
            expect(result).toEqual('050B000A');
        });
        it('should translate "tnei t0 10" to hex', () => {
            const result = service.translateInstructionToHex('tnei t0 10');
            expect(result).toEqual('050E000A');
        });
    });
    describe('Translate hex to I-trap instructions', ()=>{
        it('should translate "050C000A" to mips', () => {
            const result = service.translateInstructionToMIPS('050C000A');
            expect(result).toEqual('teqi $t0 0x000A');
        });
        it('should translate "0508000A" to mips', () => {
            const result = service.translateInstructionToMIPS('0508000A');
            expect(result).toEqual('tgei $t0 0x000A');
        });
        it('should translate "0509000A" to mips', () => {
            const result = service.translateInstructionToMIPS('0509000A');
            expect(result).toEqual('tgeiu $t0 0x000A');
        });
        it('should translate "050A000A" to mips', () => {
            const result = service.translateInstructionToMIPS('050A000A');
            expect(result).toEqual('tlti $t0 0x000A');
        });
        it('should translate "050B000A" to mips', () => {
            const result = service.translateInstructionToMIPS('050B000A');
            expect(result).toEqual('tltiu $t0 0x000A');
        });
        it('should translate "050E000A" to mips', () => {
            const result = service.translateInstructionToMIPS('050E000A');
            expect(result).toEqual('tnei $t0 0x000A');
        });
    });
});
