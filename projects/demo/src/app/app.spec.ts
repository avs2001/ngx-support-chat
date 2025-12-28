import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { App } from './app';
import { MockChatService } from './services/mock-chat.service';

/* eslint-disable @angular-eslint/component-selector */
// Mock the ChatContainerComponent since we're testing demo app behavior, not the library
@Component({
  selector: 'ngx-chat-container',
  standalone: true,
  template: '<div class="mock-chat-container"><ng-content></ng-content></div>'
})
class MockChatContainerComponent {}
/* eslint-enable @angular-eslint/component-selector */

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, MockChatContainerComponent],
      providers: [MockChatService]
    })
      .overrideComponent(App, {
        set: {
          imports: [FormsModule, MockChatContainerComponent]
        }
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have currentUserId defined', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.currentUserId).toBe('user-1');
  });

  it('should initialize with conversation scenario', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.activeScenario()).toBe('conversation');
  });

  it('should render chat container', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Using mock component
    expect(compiled.querySelector('ngx-chat-container')).toBeTruthy();
  });

  it('should render configuration panel by default', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.config-panel')).toBeTruthy();
  });

  it('should toggle config panel visibility', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.showConfigPanel()).toBe(true);

    app.toggleConfigPanel();
    expect(app.showConfigPanel()).toBe(false);

    app.toggleConfigPanel();
    expect(app.showConfigPanel()).toBe(true);
  });
});
