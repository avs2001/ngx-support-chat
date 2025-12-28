import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AutoResizeDirective } from './auto-resize.directive';

@Component({
  standalone: true,
  imports: [AutoResizeDirective],
  template: `<textarea [ngxAutoResize]="maxHeight" #textarea></textarea>`
})
class TestHostComponent {
  maxHeight = 120;
}

@Component({
  standalone: true,
  imports: [AutoResizeDirective],
  template: `<textarea ngxAutoResize></textarea>`
})
class TestHostDefaultComponent {}

describe('AutoResizeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let textarea: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    textarea = fixture.nativeElement.querySelector('textarea');
  });

  describe('initialization', () => {
    it('should create the directive', () => {
      expect(textarea).toBeTruthy();
    });

    it('should set resize to none', () => {
      expect(textarea.style.resize).toBe('none');
    });

    it('should set overflow-y to hidden initially', () => {
      expect(textarea.style.overflowY).toBe('hidden');
    });

    it('should set box-sizing to border-box', () => {
      expect(textarea.style.boxSizing).toBe('border-box');
    });
  });

  describe('auto-resize behavior', () => {
    it('should resize on input event', () => {
      const initialHeight = textarea.offsetHeight;

      // Simulate typing multi-line content
      textarea.value = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Height should have changed (or be at max)
      expect(textarea.style.height).not.toBe('');
    });

    it('should respect max height', () => {
      // Set a small max height
      fixture.componentInstance.maxHeight = 50;
      fixture.detectChanges();

      // Add lots of content
      textarea.value = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Height should not exceed max
      const height = parseInt(textarea.style.height, 10);
      expect(height).toBeLessThanOrEqual(50);
    });

    it('should show scrollbar when content exceeds max height', () => {
      fixture.componentInstance.maxHeight = 50;
      fixture.detectChanges();

      // Mock scrollHeight to be greater than max
      Object.defineProperty(textarea, 'scrollHeight', {
        value: 200,
        configurable: true
      });

      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(textarea.style.overflowY).toBe('auto');
    });

    it('should hide scrollbar when content fits', () => {
      // Mock scrollHeight to be less than max
      Object.defineProperty(textarea, 'scrollHeight', {
        value: 40,
        configurable: true
      });

      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(textarea.style.overflowY).toBe('hidden');
    });
  });

  describe('default max height', () => {
    let defaultFixture: ComponentFixture<TestHostDefaultComponent>;
    let defaultTextarea: HTMLTextAreaElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostDefaultComponent]
      }).compileComponents();

      defaultFixture = TestBed.createComponent(TestHostDefaultComponent);
      defaultFixture.detectChanges();
      defaultTextarea = defaultFixture.nativeElement.querySelector('textarea');
    });

    it('should use default max height of 120px', () => {
      // Mock scrollHeight greater than default
      Object.defineProperty(defaultTextarea, 'scrollHeight', {
        value: 200,
        configurable: true
      });

      defaultTextarea.dispatchEvent(new Event('input'));
      defaultFixture.detectChanges();

      const height = parseInt(defaultTextarea.style.height, 10);
      expect(height).toBeLessThanOrEqual(120);
    });
  });

  describe('directive methods', () => {
    it('should have resize method', () => {
      // Trigger resize indirectly via input
      textarea.value = 'test';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Just verify it doesn't throw
      expect(textarea.style.height).toBeTruthy();
    });
  });
});
