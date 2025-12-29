import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { NgAddOptions } from './schema';

export function ngAdd(options: NgAddOptions): Rule {
  return chain([
    addPeerDependencies(),
    addOptionalDependencies(options),
    addDefaultStyles(options),
    logNextSteps(options),
    installPackages()
  ]);
}

function addPeerDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Adding peer dependencies...');

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@angular/cdk',
      version: '^21.0.0'
    });

    return tree;
  };
}

function addOptionalDependencies(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.includeMarkdown) {
      context.logger.info('Adding ngx-markdown for markdown support...');

      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: 'ngx-markdown',
        version: '^21.0.0'
      });

      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: 'marked',
        version: '^12.0.0'
      });
    }

    return tree;
  };
}

function addDefaultStyles(options: NgAddOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    if (options.addDefaultStyles === false) {
      return tree;
    }

    const workspace = await getWorkspace(tree);
    const projectName = options.project || (workspace.extensions['defaultProject'] as string | undefined);

    if (!projectName) {
      context.logger.warn('Could not determine project name');
      return tree;
    }

    const project = workspace.projects.get(projectName);
    if (!project) {
      context.logger.warn(`Could not find project "${projectName}"`);
      return tree;
    }

    const stylesPath = findStylesFile(tree, project);

    if (stylesPath) {
      const content = tree.read(stylesPath)?.toString('utf-8') ?? '';
      const importStatement = `@import 'ngx-support-chat/styles/tokens.css';\n\n`;

      if (!content.includes('ngx-support-chat')) {
        tree.overwrite(stylesPath, importStatement + content);
        context.logger.info(`✅ Added CSS tokens import to ${stylesPath}`);
      } else {
        context.logger.info('CSS tokens import already exists');
      }
    } else {
      context.logger.warn('Could not find global styles file. Please add the following import manually:');
      context.logger.warn("  @import 'ngx-support-chat/styles/tokens.css';");
    }

    return tree;
  };
}

function findStylesFile(
  tree: Tree,
  project: { root: string; targets?: { get(name: string): { options?: Record<string, unknown> } | undefined } }
): string | null {
  const buildTarget = project.targets?.get('build');
  const styles = buildTarget?.options?.['styles'] as (string | object)[] | undefined;

  if (styles && styles.length > 0) {
    const mainStyles = styles.find(
      (s): s is string => typeof s === 'string' && (s.endsWith('.scss') || s.endsWith('.css'))
    );
    if (mainStyles && tree.exists(mainStyles)) {
      return mainStyles;
    }
  }

  const commonPaths = [
    'src/styles.scss',
    'src/styles.css',
    `${project.root}/src/styles.scss`,
    `${project.root}/src/styles.css`
  ];

  for (const path of commonPaths) {
    if (tree.exists(path)) {
      return path;
    }
  }

  return null;
}

function logNextSteps(options: NgAddOptions): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.info('');
    context.logger.info('╔════════════════════════════════════════════════════════════╗');
    context.logger.info('║           ngx-support-chat installed successfully!         ║');
    context.logger.info('╚════════════════════════════════════════════════════════════╝');
    context.logger.info('');
    context.logger.info('Next steps:');
    context.logger.info('');

    if (options.includeMarkdown) {
      context.logger.info('1. Add providers to your app.config.ts:');
      context.logger.info('');
      context.logger.info('   import { provideMarkdown, MarkdownService } from "ngx-markdown";');
      context.logger.info('   import { provideChatConfig, MARKDOWN_SERVICE } from "ngx-support-chat";');
      context.logger.info('');
      context.logger.info('   export const appConfig: ApplicationConfig = {');
      context.logger.info('     providers: [');
      context.logger.info('       provideMarkdown(),');
      context.logger.info('       { provide: MARKDOWN_SERVICE, useExisting: MarkdownService },');
      context.logger.info('       provideChatConfig({');
      context.logger.info('         markdown: { enabled: true, displayMode: true }');
      context.logger.info('       })');
      context.logger.info('     ]');
      context.logger.info('   };');
    } else {
      context.logger.info('1. Add provideChatConfig() to your app.config.ts:');
      context.logger.info('');
      context.logger.info('   import { provideChatConfig } from "ngx-support-chat";');
      context.logger.info('');
      context.logger.info('   export const appConfig: ApplicationConfig = {');
      context.logger.info('     providers: [');
      context.logger.info('       provideChatConfig({');
      context.logger.info('         markdown: { enabled: false }');
      context.logger.info('       })');
      context.logger.info('     ]');
      context.logger.info('   };');
    }

    context.logger.info('');
    context.logger.info('2. Use the component in your template:');
    context.logger.info('');
    context.logger.info('   <ngx-chat-container');
    context.logger.info('     [messages]="messages"');
    context.logger.info('     [currentUserId]="userId"');
    context.logger.info('     (messageSend)="onSend($event)">');
    context.logger.info('   </ngx-chat-container>');
    context.logger.info('');
    context.logger.info('3. Customize CSS tokens in your global styles (optional):');
    context.logger.info('');
    context.logger.info('   :root {');
    context.logger.info('     --ngx-bubble-user-bg: #7c3aed;');
    context.logger.info('   }');
    context.logger.info('');

    return _tree;
  };
}

function installPackages(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    return _tree;
  };
}
