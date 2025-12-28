import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CHAT_CONFIG, ChatConfig, DEFAULT_CHAT_CONFIG, provideChatConfig } from '../../tokens/chat-config.token';
import { ChatConfigService } from './chat-config.service';

describe('ChatConfigService', () => {
  describe('with default configuration', () => {
    it('should be created', () => {
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ChatConfigService);
      expect(service).toBeTruthy();
    });

    it('should return default markdown config', () => {
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ChatConfigService);

      expect(service.markdown()).toEqual({
        enabled: false,
        displayMode: false,
        inputMode: false
      });
    });

    it('should return default date format', () => {
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ChatConfigService);

      expect(service.dateFormat()).toBe('MMMM d, yyyy');
    });

    it('should return default time format', () => {
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ChatConfigService);

      expect(service.timeFormat()).toBe('HH:mm');
    });

    it('should return default date separator labels', () => {
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ChatConfigService);

      expect(service.dateSeparatorLabels()).toEqual({
        today: 'Today',
        yesterday: 'Yesterday'
      });
    });

    it('should return full default config', () => {
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ChatConfigService);

      expect(service.fullConfig()).toEqual(DEFAULT_CHAT_CONFIG);
    });
  });

  describe('with custom configuration', () => {
    const customConfig: Partial<ChatConfig> = {
      markdown: {
        enabled: true,
        displayMode: true,
        inputMode: false
      },
      dateFormat: 'dd/MM/yyyy',
      timeFormat: 'h:mm a',
      dateSeparatorLabels: {
        today: 'Heute',
        yesterday: 'Gestern'
      }
    };

    it('should use provided markdown config', () => {
      TestBed.configureTestingModule({
        providers: [provideChatConfig(customConfig)]
      });
      const service = TestBed.inject(ChatConfigService);

      expect(service.markdown()).toEqual({
        enabled: true,
        displayMode: true,
        inputMode: false
      });
    });

    it('should use provided date format', () => {
      TestBed.configureTestingModule({
        providers: [provideChatConfig(customConfig)]
      });
      const service = TestBed.inject(ChatConfigService);

      expect(service.dateFormat()).toBe('dd/MM/yyyy');
    });

    it('should use provided time format', () => {
      TestBed.configureTestingModule({
        providers: [provideChatConfig(customConfig)]
      });
      const service = TestBed.inject(ChatConfigService);

      expect(service.timeFormat()).toBe('h:mm a');
    });

    it('should use provided date separator labels', () => {
      TestBed.configureTestingModule({
        providers: [provideChatConfig(customConfig)]
      });
      const service = TestBed.inject(ChatConfigService);

      expect(service.dateSeparatorLabels()).toEqual({
        today: 'Heute',
        yesterday: 'Gestern'
      });
    });
  });

  describe('with partial configuration', () => {
    it('should merge partial config with defaults', () => {
      TestBed.configureTestingModule({
        providers: [
          provideChatConfig({
            dateFormat: 'yyyy-MM-dd'
          })
        ]
      });
      const service = TestBed.inject(ChatConfigService);

      // Custom value
      expect(service.dateFormat()).toBe('yyyy-MM-dd');
      // Default values preserved
      expect(service.timeFormat()).toBe('HH:mm');
      expect(service.markdown()).toEqual(DEFAULT_CHAT_CONFIG.markdown);
    });

    it('should deep merge nested markdown config', () => {
      TestBed.configureTestingModule({
        providers: [
          provideChatConfig({
            markdown: {
              enabled: true,
              displayMode: true,
              inputMode: false
            }
          })
        ]
      });
      const service = TestBed.inject(ChatConfigService);

      expect(service.markdown()).toEqual({
        enabled: true,
        displayMode: true,
        inputMode: false
      });
      // Other defaults preserved
      expect(service.dateFormat()).toBe('MMMM d, yyyy');
    });
  });

  describe('direct CHAT_CONFIG injection', () => {
    it('should allow direct token injection', () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: CHAT_CONFIG,
            useValue: {
              ...DEFAULT_CHAT_CONFIG,
              dateFormat: 'direct-injection'
            }
          }
        ]
      });
      const config = TestBed.inject(CHAT_CONFIG);

      expect(config.dateFormat).toBe('direct-injection');
    });
  });
});
