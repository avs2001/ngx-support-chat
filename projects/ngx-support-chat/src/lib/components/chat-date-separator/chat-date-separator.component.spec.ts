import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { CHAT_CONFIG, DEFAULT_CHAT_CONFIG } from '../../../tokens/chat-config.token';

import { ChatDateSeparatorComponent } from './chat-date-separator.component';

describe('ChatDateSeparatorComponent', () => {
  let fixture: ComponentFixture<ChatDateSeparatorComponent>;
  let component: ChatDateSeparatorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDateSeparatorComponent],
      providers: [{ provide: CHAT_CONFIG, useValue: DEFAULT_CHAT_CONFIG }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatDateSeparatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('date', new Date());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('displayText', () => {
    it('should display "Today" for today\'s date', () => {
      const today = new Date();
      fixture.componentRef.setInput('date', today);
      fixture.detectChanges();

      expect(component.displayText()).toBe('Today');
    });

    it('should display "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      fixture.componentRef.setInput('date', yesterday);
      fixture.detectChanges();

      expect(component.displayText()).toBe('Yesterday');
    });

    it('should display formatted date for older dates', () => {
      const oldDate = new Date(2025, 0, 15); // January 15, 2025
      fixture.componentRef.setInput('date', oldDate);
      fixture.detectChanges();

      // Default format is 'MMMM d, yyyy'
      expect(component.displayText()).toBe('January 15, 2025');
    });

    it('should display formatted date for dates more than two days ago', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      fixture.componentRef.setInput('date', threeDaysAgo);
      fixture.detectChanges();

      // Should not be "Today" or "Yesterday"
      expect(component.displayText()).not.toBe('Today');
      expect(component.displayText()).not.toBe('Yesterday');
    });
  });

  describe('accessibility', () => {
    it('should have role="separator"', () => {
      fixture.componentRef.setInput('date', new Date());
      fixture.detectChanges();

      const separator = fixture.nativeElement.querySelector('.date-separator');
      expect(separator.getAttribute('role')).toBe('separator');
    });

    it('should have aria-label describing the date', () => {
      const today = new Date();
      fixture.componentRef.setInput('date', today);
      fixture.detectChanges();

      const separator = fixture.nativeElement.querySelector('.date-separator');
      expect(separator.getAttribute('aria-label')).toBe('Messages from Today');
    });
  });

  describe('rendering', () => {
    it('should render the text in a span', () => {
      const today = new Date();
      fixture.componentRef.setInput('date', today);
      fixture.detectChanges();

      const textSpan = fixture.nativeElement.querySelector('.date-separator__text');
      expect(textSpan).toBeTruthy();
      expect(textSpan.textContent).toBe('Today');
    });
  });
});

describe('ChatDateSeparatorComponent with custom config', () => {
  let fixture: ComponentFixture<ChatDateSeparatorComponent>;

  it('should use custom date separator labels', async () => {
    const customConfig = {
      ...DEFAULT_CHAT_CONFIG,
      dateSeparatorLabels: {
        today: "Aujourd'hui",
        yesterday: 'Hier'
      }
    };

    await TestBed.configureTestingModule({
      imports: [ChatDateSeparatorComponent],
      providers: [{ provide: CHAT_CONFIG, useValue: customConfig }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatDateSeparatorComponent);
    fixture.componentRef.setInput('date', new Date());
    fixture.detectChanges();

    expect(fixture.componentInstance.displayText()).toBe("Aujourd'hui");
  });

  it('should use custom date format', async () => {
    const customConfig = {
      ...DEFAULT_CHAT_CONFIG,
      dateFormat: 'dd/MM/yyyy'
    };

    await TestBed.configureTestingModule({
      imports: [ChatDateSeparatorComponent],
      providers: [{ provide: CHAT_CONFIG, useValue: customConfig }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatDateSeparatorComponent);
    const oldDate = new Date(2025, 0, 15);
    fixture.componentRef.setInput('date', oldDate);
    fixture.detectChanges();

    expect(fixture.componentInstance.displayText()).toBe('15/01/2025');
  });
});
