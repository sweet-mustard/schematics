import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  empty,
  mergeWith,
  move,
  noop,
  schematic
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  NodePackageLinkTask,
  RepositoryInitializerTask
} from '@angular-devkit/schematics/tasks';
import { Schema as ApplicationOptions } from '../application/schema';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { Schema as NgNewOptions } from './schema';

export default function(options: NgNewOptions): Rule {
  if (!options.name) {
    throw new SchematicsException(`Invalid options, "name" is required.`);
  }

  if (!options.directory) {
    options.directory = options.name;
  }

  const workspaceOptions: WorkspaceOptions = {
    name: options.name,
    version: options.version,
    newProjectRoot: options.newProjectRoot || 'projects'
  };
  const applicationOptions: ApplicationOptions = {
    projectRoot: '',
    name: options.name,
    enableIvy: options.enableIvy,
    inlineStyle: options.inlineStyle,
    inlineTemplate: options.inlineTemplate,
    prefix: options.prefix,
    viewEncapsulation: options.viewEncapsulation,
    routing: options.routing,
    style: options.style,
    moduleName: options.moduleName ? options.moduleName : undefined,
    skipInstall: true,
    skipTests: options.skipTests,
    skipPackageJson: false
  };

  return chain([
    mergeWith(
      apply(empty(), [
        schematic('workspace', workspaceOptions),
        options.createApplication ? schematic('application', applicationOptions) : noop,
        move(options.directory)
      ])
    ),
    (_host: Tree, context: SchematicContext) => {
      let packageTask;
      if (!options.skipInstall) {
        packageTask = context.addTask(new NodePackageInstallTask(options.directory));
        if (options.linkCli) {
          packageTask = context.addTask(new NodePackageLinkTask('@angular/cli', options.directory), [packageTask]);
        }
      }
      if (!options.skipGit) {
        const commit = typeof options.commit == 'object' ? options.commit : !!options.commit ? {} : false;

        context.addTask(new RepositoryInitializerTask(options.directory, commit), packageTask ? [packageTask] : []);
      }
    }
  ]);
}
