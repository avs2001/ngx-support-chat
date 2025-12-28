import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { ChatTypingIndicatorComponent } from './chat-typing-indicator.component';
import { TypingIndicator } from '../../../models/public-api';

describe('ChatTypingIndicatorComponent', () => {
  let component: ChatTypingIndicatorComponent;
  let fixture: ComponentFixture<ChatTypingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatTypingIndicatorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatTypingIndicatorComponent);
    component = fixture.componentInstance;
  });

  function setTypingIndicator(indicator: TypingIndicator): void {
    fixture.componentRef.setInput('typingIndicator', indicator);
    fixture.detectChanges();
  }

  const basicIndicator: TypingIndicator = {
    userId: 'agent-1',
    userName: 'Support Agent'
  };

  const indicatorWithAvatar: TypingIndicator = {
    userId: 'agent-1',
    userName: 'Support Agent',
    avatar: 'https://example.com/avatar.png'
  };

  describe('component creation', () => {
    it('should create', () => {
      setTypingIndicator(basicIndicator);
      expect(component).toBeTruthy();
    });

    it('should render typing indicator container', () => {
      setTypingIndicator(basicIndicator);
      const container = fixture.nativeElement.querySelector('.typing-indicator');
      expect(container).toBeTruthy();
    });
  });

  describe('dots animation', () => {
    it('should render three dots', () => {
      setTypingIndicator(basicIndicator);
      const dots = fixture.nativeElement.querySelectorAll('.typing-indicator__dot');
      expect(dots.length).toBe(3);
    });

    it('should have dots container with aria-hidden', () => {
      setTypingIndicator(basicIndicator);
      const dotsContainer = fixture.nativeElement.querySelector('.typing-indicator__dots');
      expect(dotsContainer.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('avatar display', () => {
    it('should not show avatar when not provided', () => {
      setTypingIndicator(basicIndicator);
      const avatar = fixture.nativeElement.querySelector('.typing-indicator__avatar');
      expect(avatar).toBeFalsy();
    });

    it('should show avatar when provided', () => {
      setTypingIndicator(indicatorWithAvatar);
      const avatar = fixture.nativeElement.querySelector('.typing-indicator__avatar');
      expect(avatar).toBeTruthy();
      expect(avatar.src).toBe(indicatorWithAvatar.avatar);
    });

    it('should have correct alt text on avatar', () => {
      setTypingIndicator(indicatorWithAvatar);
      const avatar = fixture.nativeElement.querySelector('.typing-indicator__avatar');
      expect(avatar.alt).toBe('Support Agent');
    });
  });

  describe('typing text', () => {
    it('should not show text by default', () => {
      setTypingIndicator(basicIndicator);
      const text = fixture.nativeElement.querySelector('.typing-indicator__text');
      expect(text).toBeFalsy();
    });

    it('should show text when showText is true', () => {
      fixture.componentRef.setInput('typingIndicator', basicIndicator);
      fixture.componentRef.setInput('showText', true);
      fixture.detectChanges();

      const text = fixture.nativeElement.querySelector('.typing-indicator__text');
      expect(text).toBeTruthy();
      expect(text.textContent.trim()).toBe('Support Agent is typing...');
    });

    it('should use user name in typing text', () => {
      const customIndicator: TypingIndicator = {
        userId: 'agent-2',
        userName: 'John Doe'
      };
      fixture.componentRef.setInput('typingIndicator', customIndicator);
      fixture.componentRef.setInput('showText', true);
      fixture.detectChanges();

      const text = fixture.nativeElement.querySelector('.typing-indicator__text');
      expect(text.textContent.trim()).toBe('John Doe is typing...');
    });
  });

  describe('accessibility', () => {
    it('should have role="status"', () => {
      setTypingIndicator(basicIndicator);
      const container = fixture.nativeElement.querySelector('.typing-indicator');
      expect(container.getAttribute('role')).toBe('status');
    });

    it('should have aria-live="polite"', () => {
      setTypingIndicator(basicIndicator);
      const container = fixture.nativeElement.querySelector('.typing-indicator');
      expect(container.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-label with typing text', () => {
      setTypingIndicator(basicIndicator);
      const container = fixture.nativeElement.querySelector('.typing-indicator');
      expect(container.getAttribute('aria-label')).toBe('Support Agent is typing...');
    });
  });

  describe('computed properties', () => {
    it('should compute userName correctly', () => {
      setTypingIndicator(basicIndicator);
      expect(component.userName()).toBe('Support Agent');
    });

    it('should compute avatar correctly', () => {
      setTypingIndicator(indicatorWithAvatar);
      expect(component.avatar()).toBe('https://example.com/avatar.png');
    });

    it('should compute hasAvatar correctly when avatar is present', () => {
      setTypingIndicator(indicatorWithAvatar);
      expect(component.hasAvatar()).toBe(true);
    });

    it('should compute hasAvatar correctly when avatar is missing', () => {
      setTypingIndicator(basicIndicator);
      expect(component.hasAvatar()).toBe(false);
    });

    it('should compute typingText correctly', () => {
      setTypingIndicator(basicIndicator);
      expect(component.typingText()).toBe('Support Agent is typing...');
    });
  });

  describe('styling structure', () => {
    it('should have typing bubble element', () => {
      setTypingIndicator(basicIndicator);
      const bubble = fixture.nativeElement.querySelector('.typing-indicator__bubble');
      expect(bubble).toBeTruthy();
    });

    it('should have dots inside bubble', () => {
      setTypingIndicator(basicIndicator);
      const bubble = fixture.nativeElement.querySelector('.typing-indicator__bubble');
      const dots = bubble.querySelector('.typing-indicator__dots');
      expect(dots).toBeTruthy();
    });
  });
});
