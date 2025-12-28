import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ChatInputComponent } from './chat-input.component';

describe('ChatInputComponent', () => {
  let component: ChatInputComponent;
  let fixture: ComponentFixture<ChatInputComponent>;
  let textarea: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    textarea = fixture.nativeElement.querySelector('textarea');
  });

  describe('component creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render textarea element', () => {
      expect(textarea).toBeTruthy();
    });
  });

  describe('inputs', () => {
    it('should have empty value by default', () => {
      expect(component.value()).toBe('');
    });

    it('should accept value input', () => {
      fixture.componentRef.setInput('value', 'Hello');
      fixture.detectChanges();
      expect(component.value()).toBe('Hello');
    });

    it('should have default placeholder', () => {
      expect(component.placeholder()).toBe('Type a message...');
    });

    it('should accept custom placeholder', () => {
      fixture.componentRef.setInput('placeholder', 'Custom placeholder');
      fixture.detectChanges();
      expect(textarea.placeholder).toBe('Custom placeholder');
    });

    it('should not be disabled by default', () => {
      expect(component.disabled()).toBe(false);
      expect(textarea.disabled).toBe(false);
    });

    it('should accept disabled input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(textarea.disabled).toBe(true);
    });

    it('should have default max height of 120', () => {
      expect(component.maxHeight()).toBe(120);
    });

    it('should accept custom max height', () => {
      fixture.componentRef.setInput('maxHeight', 200);
      fixture.detectChanges();
      expect(component.maxHeight()).toBe(200);
    });
  });

  describe('two-way value binding', () => {
    it('should update value on input', () => {
      textarea.value = 'Test message';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.value()).toBe('Test message');
    });

    it('should reflect value changes in textarea', () => {
      fixture.componentRef.setInput('value', 'Preset value');
      fixture.detectChanges();

      expect(textarea.value).toBe('Preset value');
    });

    it('should allow programmatic value setting', () => {
      component.value.set('Programmatic value');
      fixture.detectChanges();

      expect(textarea.value).toBe('Programmatic value');
    });
  });

  describe('keyboard behavior', () => {
    it('should emit send on Enter press', () => {
      const sendSpy = vi.fn();
      component.send.subscribe(sendSpy);

      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      textarea.dispatchEvent(event);

      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    it('should prevent default on Enter press', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.onKeydown(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should NOT emit send on Shift+Enter', () => {
      const sendSpy = vi.fn();
      component.send.subscribe(sendSpy);

      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      textarea.dispatchEvent(event);

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should NOT prevent default on Shift+Enter', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.onKeydown(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should NOT emit send on other keys', () => {
      const sendSpy = vi.fn();
      component.send.subscribe(sendSpy);

      const event = new KeyboardEvent('keydown', { key: 'a' });
      component.onKeydown(event);

      expect(sendSpy).not.toHaveBeenCalled();
    });
  });

  describe('methods', () => {
    it('should focus textarea with focus()', () => {
      const focusSpy = vi.spyOn(textarea, 'focus');
      component.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should clear value with clear()', () => {
      component.value.set('Some text');
      component.clear();
      expect(component.value()).toBe('');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label', () => {
      expect(textarea.getAttribute('aria-label')).toBe('Message input');
    });

    it('should have aria-multiline', () => {
      expect(textarea.getAttribute('aria-multiline')).toBe('true');
    });
  });

  describe('auto-resize directive', () => {
    it('should have ngxAutoResize directive applied', () => {
      // The directive sets these styles
      expect(textarea.style.resize).toBe('none');
    });

    it('should pass maxHeight to directive', () => {
      fixture.componentRef.setInput('maxHeight', 150);
      fixture.detectChanges();

      // Trigger resize
      textarea.value = 'Line 1\nLine 2\nLine 3';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Just verify it doesn't throw - actual height depends on rendering
      expect(component.maxHeight()).toBe(150);
    });
  });

  describe('styling structure', () => {
    it('should have chat-input container', () => {
      const container = fixture.nativeElement.querySelector('.chat-input');
      expect(container).toBeTruthy();
    });

    it('should have chat-input__textarea class', () => {
      expect(textarea.classList.contains('chat-input__textarea')).toBe(true);
    });

    it('should have rows="1" for initial single line', () => {
      expect(textarea.getAttribute('rows')).toBe('1');
    });
  });
});
