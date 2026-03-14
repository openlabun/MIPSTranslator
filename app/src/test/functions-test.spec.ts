import { TestBed } from '@angular/core/testing';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';

describe('TranslatorService', () => {
  let service: TranslatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslatorService],
    });
    service = TestBed.inject(TranslatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Default version should be R6', () => {
    it('should start with R6 as default version', () => {
      expect(service.getVersion()).toBe('r6');
    });
  });

  describe('it must accept 0x hex instructions', () => {
    beforeEach(() => {
      service.setVersion('legacy'); // Asegurar versión para consistencia
    });

    it('should translate "0x1920009F" to mips', () => {
      const result = service.translateInstructionToMIPS('0x1920009F');
      expect(result).toEqual('blez $t1 0x009F');
    });

    it('should also work in R6', () => {
      service.setVersion('r6');
      const result = service.translateInstructionToMIPS('0x1920009F');
      expect(result).toEqual('blez $t1 0x009F');
    });
  });
});
