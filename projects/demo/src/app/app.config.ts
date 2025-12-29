import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideMarkdown, MarkdownService } from 'ngx-markdown';
import { provideChatConfig, MARKDOWN_SERVICE } from 'ngx-support-chat';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideMarkdown(),
    { provide: MARKDOWN_SERVICE, useExisting: MarkdownService },
    provideChatConfig({
      markdown: {
        enabled: true,
        displayMode: true,
        inputMode: true
      },
      dateFormat: 'MMM d, yyyy'
    })
  ]
};
