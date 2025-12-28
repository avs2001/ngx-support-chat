import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ChatQuickRepliesComponent } from './chat-quick-replies.component';
import { QuickReplySet, QuickReplySubmitEvent } from '../../../models/public-api';

describe('ChatQuickRepliesComponent', () => {
  let component: ChatQuickRepliesComponent;
  let fixture: ComponentFixture<ChatQuickRepliesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatQuickRepliesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatQuickRepliesComponent);
    component = fixture.componentInstance;
  });

  function setQuickReplies(quickReplies: QuickReplySet): void {
    fixture.componentRef.setInput('quickReplies', quickReplies);
    fixture.detectChanges();
  }

  describe('confirmation type', () => {
    const confirmationSet: QuickReplySet = {
      id: 'qr-1',
      type: 'confirmation',
      prompt: 'Please confirm your action',
      options: [{ value: 'confirmed', label: 'Confirm' }],
      submitted: false
    };

    it('should render confirmation button', () => {
      setQuickReplies(confirmationSet);

      const button = fixture.nativeElement.querySelector('.quick-reply-option--confirmation');
      expect(button).toBeTruthy();
      expect(button.textContent.trim()).toBe('Confirm');
    });

    it('should display prompt text', () => {
      setQuickReplies(confirmationSet);

      const prompt = fixture.nativeElement.querySelector('.quick-replies__prompt');
      expect(prompt).toBeTruthy();
      expect(prompt.textContent.trim()).toBe('Please confirm your action');
    });

    it('should emit quickReplySubmit when confirmation is clicked', () => {
      setQuickReplies(confirmationSet);

      const emitSpy = vi.fn();
      component.quickReplySubmit.subscribe(emitSpy);

      const button = fixture.nativeElement.querySelector('.quick-reply-option--confirmation');
      button.click();

      expect(emitSpy).toHaveBeenCalledWith({
        type: 'confirmation',
        value: 'confirmed'
      } satisfies QuickReplySubmitEvent);
    });

    it('should disable button after submission', () => {
      setQuickReplies({ ...confirmationSet, submitted: true });

      const button = fixture.nativeElement.querySelector('.quick-reply-option--confirmation');
      expect(button.disabled).toBe(true);
    });
  });

  describe('single-choice type', () => {
    const singleChoiceSet: QuickReplySet = {
      id: 'qr-2',
      type: 'single-choice',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'maybe', label: 'Maybe' }
      ],
      submitted: false
    };

    it('should render all options as buttons', () => {
      setQuickReplies(singleChoiceSet);

      const buttons = fixture.nativeElement.querySelectorAll('.quick-reply-option');
      expect(buttons.length).toBe(3);
      expect(buttons[0].textContent.trim()).toBe('Yes');
      expect(buttons[1].textContent.trim()).toBe('No');
      expect(buttons[2].textContent.trim()).toBe('Maybe');
    });

    it('should emit quickReplySubmit when option is clicked', () => {
      setQuickReplies(singleChoiceSet);

      const emitSpy = vi.fn();
      component.quickReplySubmit.subscribe(emitSpy);

      const buttons = fixture.nativeElement.querySelectorAll('.quick-reply-option');
      buttons[1].click();

      expect(emitSpy).toHaveBeenCalledWith({
        type: 'single-choice',
        value: 'no'
      } satisfies QuickReplySubmitEvent);
    });

    it('should show selected state after submission', () => {
      setQuickReplies({
        ...singleChoiceSet,
        submitted: true,
        selectedValues: ['yes']
      });

      const buttons = fixture.nativeElement.querySelectorAll('.quick-reply-option');
      expect(buttons[0].classList.contains('quick-reply-option--selected')).toBe(true);
      expect(buttons[1].classList.contains('quick-reply-option--muted')).toBe(true);
      expect(buttons[2].classList.contains('quick-reply-option--muted')).toBe(true);
    });

    it('should disable all buttons after submission', () => {
      setQuickReplies({ ...singleChoiceSet, submitted: true, selectedValues: ['yes'] });

      const buttons = fixture.nativeElement.querySelectorAll('.quick-reply-option');
      buttons.forEach((button: HTMLButtonElement) => {
        expect(button.disabled).toBe(true);
      });
    });

    it('should respect disabled option', () => {
      const setWithDisabled: QuickReplySet = {
        ...singleChoiceSet,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No', disabled: true }
        ]
      };
      setQuickReplies(setWithDisabled);

      const buttons = fixture.nativeElement.querySelectorAll('.quick-reply-option');
      expect(buttons[1].disabled).toBe(true);
    });
  });

  describe('multiple-choice type', () => {
    const multipleChoiceSet: QuickReplySet = {
      id: 'qr-3',
      type: 'multiple-choice',
      prompt: 'Select all that apply',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
        { value: 'c', label: 'Option C' }
      ],
      submitted: false
    };

    it('should render checkboxes for all options', () => {
      setQuickReplies(multipleChoiceSet);

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(3);
    });

    it('should render submit button', () => {
      setQuickReplies(multipleChoiceSet);

      const submitBtn = fixture.nativeElement.querySelector('.quick-reply-submit');
      expect(submitBtn).toBeTruthy();
      expect(submitBtn.textContent.trim()).toBe('Submit');
    });

    it('should disable submit button when no selections', () => {
      setQuickReplies(multipleChoiceSet);

      const submitBtn = fixture.nativeElement.querySelector('.quick-reply-submit');
      expect(submitBtn.disabled).toBe(true);
    });

    it('should enable submit button when selections are made', () => {
      setQuickReplies(multipleChoiceSet);

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      checkboxes[0].click();
      fixture.detectChanges();

      const submitBtn = fixture.nativeElement.querySelector('.quick-reply-submit');
      expect(submitBtn.disabled).toBe(false);
    });

    it('should toggle selections', () => {
      setQuickReplies(multipleChoiceSet);

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');

      // Select first option
      checkboxes[0].click();
      expect(component.selectedValues()).toEqual(['a']);

      // Select second option
      checkboxes[1].click();
      expect(component.selectedValues()).toEqual(['a', 'b']);

      // Deselect first option
      checkboxes[0].click();
      expect(component.selectedValues()).toEqual(['b']);
    });

    it('should emit quickReplySubmit with all selections on submit', () => {
      setQuickReplies(multipleChoiceSet);

      const emitSpy = vi.fn();
      component.quickReplySubmit.subscribe(emitSpy);

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      checkboxes[0].click();
      checkboxes[2].click();
      fixture.detectChanges();

      const submitBtn = fixture.nativeElement.querySelector('.quick-reply-submit');
      submitBtn.click();

      expect(emitSpy).toHaveBeenCalledWith({
        type: 'multiple-choice',
        value: ['a', 'c']
      } satisfies QuickReplySubmitEvent);
    });

    it('should hide submit button and show selected state after submission', () => {
      setQuickReplies({
        ...multipleChoiceSet,
        submitted: true,
        selectedValues: ['a', 'c']
      });

      const submitBtn = fixture.nativeElement.querySelector('.quick-reply-submit');
      expect(submitBtn).toBeFalsy();

      const checkboxLabels = fixture.nativeElement.querySelectorAll('.quick-reply-checkbox');
      expect(checkboxLabels[0].classList.contains('quick-reply-option--selected')).toBe(true);
      expect(checkboxLabels[1].classList.contains('quick-reply-option--muted')).toBe(true);
      expect(checkboxLabels[2].classList.contains('quick-reply-option--selected')).toBe(true);
    });

    it('should disable checkboxes after submission', () => {
      setQuickReplies({
        ...multipleChoiceSet,
        submitted: true,
        selectedValues: ['a']
      });

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox: HTMLInputElement) => {
        expect(checkbox.disabled).toBe(true);
      });
    });
  });

  describe('computed properties', () => {
    it('should correctly identify type', () => {
      setQuickReplies({
        id: 'qr-1',
        type: 'single-choice',
        options: [{ value: 'x', label: 'X' }],
        submitted: false
      });

      expect(component.type()).toBe('single-choice');
    });

    it('should correctly identify submission state', () => {
      setQuickReplies({
        id: 'qr-1',
        type: 'confirmation',
        options: [{ value: 'ok', label: 'OK' }],
        submitted: true
      });

      expect(component.isSubmitted()).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have role="radiogroup" for single-choice', () => {
      setQuickReplies({
        id: 'qr-1',
        type: 'single-choice',
        options: [{ value: 'a', label: 'A' }],
        submitted: false
      });

      const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
      expect(group).toBeTruthy();
    });

    it('should have role="radio" on single-choice options', () => {
      setQuickReplies({
        id: 'qr-1',
        type: 'single-choice',
        options: [{ value: 'a', label: 'A' }],
        submitted: false
      });

      const radio = fixture.nativeElement.querySelector('[role="radio"]');
      expect(radio).toBeTruthy();
    });

    it('should have role="group" for multiple-choice', () => {
      setQuickReplies({
        id: 'qr-1',
        type: 'multiple-choice',
        options: [{ value: 'a', label: 'A' }],
        submitted: false
      });

      const group = fixture.nativeElement.querySelector('[role="group"]');
      expect(group).toBeTruthy();
    });
  });
});
