import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('ngx-support-chat installed successfully.');
    context.logger.info('Import NgxChatContainerComponent in your component to get started.');
    return tree;
  };
}
