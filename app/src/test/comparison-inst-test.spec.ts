import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService comparison instruction tests', () => {
  let service: TranslatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslatorService],
    });
    service = TestBed.inject(TranslatorService);
  });

  describe('Translate comparison instructions to hex (Both versions)', () => {
    beforeEach(() => {
      service.setVersion('legacy'); // SLT existe en ambas versiones
    });

    it('should translate "slt $s1, $s2, $s3" to hex', () => {
      const result = service.translateInstructionToHex('slt $s1 $s2 $s3');
      expect(result).toEqual('0253882A');
    });
  });

  describe('Translate hex to comparison instructions (Both versions)', () => {
    beforeEach(() => {
      service.setVersion('legacy');
    });

    it('should translate "0253882A" to mips', () => {
      const result = service.translateInstructionToMIPS('0253882A');
      expect(result).toEqual('slt $s1 $s2 $s3');
    });
  });

  describe('SLT also works in R6', () => {
    beforeEach(() => {
      service.setVersion('r6');
    });

    it('should translate SLT in R6', () => {
      const result = service.translateInstructionToHex('slt $s1 $s2 $s3');
      expect(result).toEqual('0253882A');
    });

    it('should translate hex to SLT in R6', () => {
      const result = service.translateInstructionToMIPS('0253882A');
      expect(result).toEqual('slt $s1 $s2 $s3');
    });
  });
});
