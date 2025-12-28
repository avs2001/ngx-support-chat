import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

import { ChatActionButtonsComponent } from './chat-action-buttons.component';

// Test host component for input binding
@Component({
  standalone: true,
  imports: [ChatActionButtonsComponent],
  template: `
    <ngx-chat-action-buttons
      [hasContent]="hasContent()"
      [disabled]="disabled()"
      [accept]="accept()"
      (send)="onSend()"
      (attachmentSelect)="onAttachmentSelect($event)"
    >
      <button chatFooterActions class="custom-action">Custom</button>
    </ngx-chat-action-buttons>
  `
})
class TestHostComponent {
  hasContent = signal(false);
  disabled = signal(false);
  accept = signal('');
  sendCalled = false;
  selectedFiles: File[] = [];

  onSend(): void {
    this.sendCalled = true;
  }

  onAttachmentSelect(files: File[]): void {
    this.selectedFiles = files;
  }
}

describe('ChatActionButtonsComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('should create the component', () => {
      expect(fixture.nativeElement.querySelector('ngx-chat-action-buttons')).toBeTruthy();
    });

    it('should render action buttons container', () => {
      const container = fixture.nativeElement.querySelector('.action-buttons');
      expect(container).toBeTruthy();
    });

    it('should render attach button', () => {
      const attachBtn = fixture.nativeElement.querySelector('.action-button--attach');
      expect(attachBtn).toBeTruthy();
    });

    it('should render send button', () => {
      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');
      expect(sendBtn).toBeTruthy();
    });

    it('should render hidden file input', () => {
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
      expect(fileInput).toBeTruthy();
      expect(fileInput.classList.contains('visually-hidden')).toBe(true);
    });
  });

  describe('send button', () => {
    it('should be disabled when hasContent is false', () => {
      host.hasContent.set(false);
      fixture.detectChanges();

      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');
      expect(sendBtn.disabled).toBe(true);
    });

    it('should be enabled when hasContent is true', () => {
      host.hasContent.set(true);
      fixture.detectChanges();

      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');
      expect(sendBtn.disabled).toBe(false);
    });

    it('should be disabled when disabled is true even with content', () => {
      host.hasContent.set(true);
      host.disabled.set(true);
      fixture.detectChanges();

      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');
      expect(sendBtn.disabled).toBe(true);
    });

    it('should emit send when clicked and enabled', () => {
      host.hasContent.set(true);
      fixture.detectChanges();

      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');
      sendBtn.click();

      expect(host.sendCalled).toBe(true);
    });

    it('should not emit send when disabled', () => {
      host.hasContent.set(true);
      host.disabled.set(true);
      fixture.detectChanges();

      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');
      sendBtn.click();

      expect(host.sendCalled).toBe(false);
    });

    it('should have accessible label', () => {
      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');
      expect(sendBtn.getAttribute('aria-label')).toBe('Send message');
    });
  });

  describe('attach button', () => {
    it('should be enabled by default', () => {
      const attachBtn = fixture.nativeElement.querySelector('.action-button--attach');
      expect(attachBtn.disabled).toBe(false);
    });

    it('should be disabled when disabled is true', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      const attachBtn = fixture.nativeElement.querySelector('.action-button--attach');
      expect(attachBtn.disabled).toBe(true);
    });

    it('should have accessible label', () => {
      const attachBtn = fixture.nativeElement.querySelector('.action-button--attach');
      expect(attachBtn.getAttribute('aria-label')).toBe('Attach files');
    });

    it('should trigger file input click when attach button clicked', () => {
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
      let clickTriggered = false;
      fileInput.addEventListener('click', (e: Event) => {
        e.preventDefault(); // Prevent actual dialog
        clickTriggered = true;
      });

      const attachBtn = fixture.nativeElement.querySelector('.action-button--attach');
      attachBtn.click();

      expect(clickTriggered).toBe(true);
    });
  });

  describe('file input', () => {
    it('should have multiple attribute', () => {
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
      expect(fileInput.hasAttribute('multiple')).toBe(true);
    });

    it('should use accept input value', () => {
      host.accept.set('image/*,.pdf');
      fixture.detectChanges();

      const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
      expect(fileInput.accept).toBe('image/*,.pdf');
    });

    it('should be hidden from accessibility tree', () => {
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
      expect(fileInput.getAttribute('aria-hidden')).toBe('true');
      expect(fileInput.tabIndex).toBe(-1);
    });

    it('should emit attachmentSelect when files are selected', () => {
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

      // Create mock files
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.pdf', { type: 'application/pdf' });

      // Create a mock FileList-like object
      const mockFileList = {
        0: file1,
        1: file2,
        length: 2,
        item: (index: number) => [file1, file2][index]
      };

      // Set files on input and trigger change
      Object.defineProperty(fileInput, 'files', {
        value: mockFileList,
        configurable: true
      });

      fileInput.dispatchEvent(new Event('change'));

      expect(host.selectedFiles.length).toBe(2);
      expect(host.selectedFiles[0].name).toBe('file1.txt');
      expect(host.selectedFiles[1].name).toBe('file2.pdf');
    });

    it('should reset file input after selection', () => {
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['content'], 'file.txt', { type: 'text/plain' });

      const mockFileList = {
        0: file,
        length: 1,
        item: () => file
      };

      Object.defineProperty(fileInput, 'files', {
        value: mockFileList,
        configurable: true
      });

      fileInput.dispatchEvent(new Event('change'));

      // Value should be reset to allow re-selecting same file
      expect(fileInput.value).toBe('');
    });

    it('should not emit when no files selected', () => {
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

      // Empty file list
      const emptyFileList = {
        length: 0,
        item: () => null
      };

      Object.defineProperty(fileInput, 'files', {
        value: emptyFileList,
        configurable: true
      });

      fileInput.dispatchEvent(new Event('change'));

      expect(host.selectedFiles.length).toBe(0);
    });
  });

  describe('content projection', () => {
    it('should project custom actions', () => {
      const customAction = fixture.nativeElement.querySelector('.custom-action');
      expect(customAction).toBeTruthy();
      expect(customAction.textContent).toBe('Custom');
    });

    it('should render projected content between attach and send buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.action-buttons > *');
      const buttonClasses = Array.from(buttons).map((b: Element) => b.className);

      // Order should be: input (hidden), attach, custom, send
      const attachIndex = buttonClasses.findIndex((c: string) => c.includes('attach'));
      const customIndex = buttonClasses.findIndex((c: string) => c.includes('custom'));
      const sendIndex = buttonClasses.findIndex((c: string) => c.includes('send'));

      expect(attachIndex).toBeLessThan(customIndex);
      expect(customIndex).toBeLessThan(sendIndex);
    });
  });

  describe('accessibility', () => {
    it('should have type="button" on action buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.action-button');
      buttons.forEach((btn: HTMLButtonElement) => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have SVG icons with aria-hidden', () => {
      const svgs = fixture.nativeElement.querySelectorAll('svg');
      svgs.forEach((svg: SVGElement) => {
        expect(svg.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('disabled state', () => {
    it('should disable all buttons when disabled is true', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      const attachBtn = fixture.nativeElement.querySelector('.action-button--attach');
      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');

      expect(attachBtn.disabled).toBe(true);
      expect(sendBtn.disabled).toBe(true);
    });

    it('should re-enable buttons when disabled changes to false', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      host.disabled.set(false);
      host.hasContent.set(true);
      fixture.detectChanges();

      const attachBtn = fixture.nativeElement.querySelector('.action-button--attach');
      const sendBtn = fixture.nativeElement.querySelector('.action-button--send');

      expect(attachBtn.disabled).toBe(false);
      expect(sendBtn.disabled).toBe(false);
    });
  });
});
