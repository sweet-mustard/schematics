import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '../application/schema';
import { createAppModule } from '@schematics/angular/utility/test';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { Schema as ContainerOptions } from './schema';
import { ChangeDetection, Style } from '@schematics/angular/component/schema';

describe('Container Schematic', () => {
  const schematicRunner = new SchematicTestRunner('@sweet-mustard/schematics', require.resolve('../collection.json'));
  const defaultOptions: ContainerOptions = {
    name: 'foo',
    // path: 'src/app',
    inlineStyle: false,
    inlineTemplate: false,
    changeDetection: ChangeDetection.Default,
    style: Style.Scss,
    skipTests: false,
    module: undefined,
    export: false,
    project: 'bar'
  };

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0'
  };

  const appOptions: ApplicationOptions = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    skipPackageJson: false
  };
  let appTree: UnitTestTree;
  beforeEach(async () => {
    appTree = await schematicRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
    appTree = await schematicRunner.runSchematicAsync('application', appOptions, appTree).toPromise();
  });

  it('should create a container', async () => {
    const options = { ...defaultOptions };
    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const files = tree.files;
    expect(files).toEqual(
      expect.arrayContaining([
        '/projects/bar/src/app/foo/foo.container.html',
        '/projects/bar/src/app/foo/foo.container.scss',
        '/projects/bar/src/app/foo/foo.container.spec.ts',
        '/projects/bar/src/app/foo/foo.container.ts'
      ])
    );
    const moduleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.container'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooContainer\r?\n/m);
  });

  it('should set change detection to OnPush', async () => {
    const options = { ...defaultOptions, changeDetection: 'OnPush' };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(tsContent).toMatch(/changeDetection: ChangeDetectionStrategy.OnPush/);
  });

  it('should not set view encapsulation', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(tsContent).not.toMatch(/encapsulation: ViewEncapsulation/);
  });

  it('should set view encapsulation to Emulated', async () => {
    const options = { ...defaultOptions, viewEncapsulation: 'Emulated' };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(tsContent).toMatch(/encapsulation: ViewEncapsulation.Emulated/);
  });

  it('should set view encapsulation to None', async () => {
    const options = { ...defaultOptions, viewEncapsulation: 'None' };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(tsContent).toMatch(/encapsulation: ViewEncapsulation.None/);
  });

  it('should create a flat container', async () => {
    const options = { ...defaultOptions, flat: true };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const files = tree.files;
    expect(files).toEqual(
      expect.arrayContaining([
        '/projects/bar/src/app/foo.container.scss',
        '/projects/bar/src/app/foo.container.html',
        '/projects/bar/src/app/foo.container.spec.ts',
        '/projects/bar/src/app/foo.container.ts'
      ])
    );
  });

  it('should find the closest module', async () => {
    const options = { ...defaultOptions };
    const fooModule = '/projects/bar/src/app/foo/foo.module.ts';
    appTree.create(
      fooModule,
      `
      import { NgModule } from '@angular/core';
      @NgModule({
        imports: [],
        declarations: []
      })
      export class FooModule { }
    `
    );

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const fooModuleContent = tree.readContent(fooModule);
    expect(fooModuleContent).toMatch(/import { FooContainer } from '.\/foo.container'/);
  });

  it('should export the container', async () => {
    const options = { ...defaultOptions, export: true };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const appModuleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
    expect(appModuleContent).toMatch(/exports: \[FooContainer\]/);
  });

  it('should set the entry component', async () => {
    const options = { ...defaultOptions, entryComponent: true };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const appModuleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
    expect(appModuleContent).toMatch(/entryComponents: \[FooContainer\]/);
  });

  it('should import into a specified module', async () => {
    const options = { ...defaultOptions, module: 'app.module.ts' };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const appModule = tree.readContent('/projects/bar/src/app/app.module.ts');

    expect(appModule).toMatch(/import { FooContainer } from '.\/foo\/foo.container'/);
  });

  it('should fail if specified module does not exist', async () => {
    const options = { ...defaultOptions, module: '/projects/bar/src/app.moduleXXX.ts' };
    let thrownError: Error | null = null;
    try {
      await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError).toBeDefined();
  });

  it('should handle upper case paths', async () => {
    const pathOption = 'projects/bar/src/app/SOME/UPPER/DIR';
    const options = { ...defaultOptions, path: pathOption };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    let files = tree.files;
    let root = `/${pathOption}/foo/foo.container`;
    expect(files).toEqual(expect.arrayContaining([`${root}.scss`, `${root}.html`, `${root}.spec.ts`, `${root}.ts`]));

    const options2 = { ...options, name: 'BAR' };
    const tree2 = await schematicRunner.runSchematicAsync('container', options2, tree).toPromise();
    files = tree2.files;
    root = `/${pathOption}/bar/bar.container`;
    expect(files).toEqual(expect.arrayContaining([`${root}.scss`, `${root}.html`, `${root}.spec.ts`, `${root}.ts`]));
  });

  it('should create a container in a sub-directory', async () => {
    const options = { ...defaultOptions, path: 'projects/bar/src/app/a/b/c' };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const files = tree.files;
    const root = `/${options.path}/foo/foo.container`;
    expect(files).toEqual(expect.arrayContaining([`${root}.scss`, `${root}.html`, `${root}.spec.ts`, `${root}.ts`]));
  });

  it('should use the prefix', async () => {
    const options = { ...defaultOptions, prefix: 'pre' };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(content).toMatch(/selector: 'pre-foo'/);
  });

  it('should use the default project prefix if none is passed', async () => {
    const options = { ...defaultOptions, prefix: undefined };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(content).toMatch(/selector: 'app-foo'/);
  });

  it('should use the supplied prefix if it is ""', async () => {
    const options = { ...defaultOptions, prefix: '' };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(content).toMatch(/selector: 'foo'/);
  });

  it('should respect the inlineTemplate option', async () => {
    const options = { ...defaultOptions, inlineTemplate: true };
    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(content).toMatch(/template: /);
    expect(content).not.toMatch(/templateUrl: /);
    expect(tree.files).not.toEqual(expect.arrayContaining(['/projects/bar/src/app/foo/foo.container.html']));
  });

  it('should respect the inlineStyle option', async () => {
    const options = { ...defaultOptions, inlineStyle: true };
    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(content).toMatch(/styles: \[/);
    expect(content).not.toMatch(/styleUrls: /);
    expect(tree.files).not.toEqual(expect.arrayContaining(['/projects/bar/src/app/foo/foo.container.scss']));
  });

  it('should respect the style option', async () => {
    const options = { ...defaultOptions, style: Style.Sass };
    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
    expect(content).toMatch(/styleUrls: \['.\/foo.container.sass/);
    expect(tree.files).toEqual(expect.arrayContaining(['/projects/bar/src/app/foo/foo.container.sass']));
    expect(tree.files).not.toEqual(expect.arrayContaining(['/projects/bar/src/app/foo/foo.container.scss']));
  });

  it('should use the module flag even if the module is a routing module', async () => {
    const routingFileName = 'app-routing.module.ts';
    const routingModulePath = `/projects/bar/src/app/${routingFileName}`;
    const newTree = createAppModule(appTree, routingModulePath);
    const options = { ...defaultOptions, module: routingFileName };
    const tree = await schematicRunner.runSchematicAsync('container', options, newTree).toPromise();
    const content = tree.readContent(routingModulePath);
    expect(content).toMatch(/import { FooContainer } from '.\/foo\/foo.container/);
  });

  it('should handle a path in the name option', async () => {
    const options = { ...defaultOptions, name: 'dir/test-container' };

    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const content = tree.readContent('/projects/bar/src/app/app.module.ts');
    expect(content).toMatch(`import { TestContainerContainer } from './dir/test-container/test-container.container`);
  });

  it('should handle a path in the name and module options', async () => {
    appTree = await schematicRunner
      .runSchematicAsync('module', { name: 'admin/module', project: 'bar' }, appTree)
      .toPromise();

    const options = { ...defaultOptions, name: 'other/test-container', module: 'admin/module', skipImport: false };
    appTree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();

    const content = appTree.readContent('/projects/bar/src/app/admin/module/module.module.ts');
    expect(content).toMatch(
      /import { TestContainerContainer } from '..\/..\/other\/test-container\/test-container.container'/
    );
  });

  it('should create the right selector with a path in the name', async () => {
    const options = { ...defaultOptions, name: 'sub/test' };
    appTree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const content = appTree.readContent('/projects/bar/src/app/sub/test/test.container.ts');
    expect(content).toMatch(/selector: 'app-test'/);
  });

  it('should respect the skipSelector option', async () => {
    const options = { ...defaultOptions, name: 'sub/test', skipSelector: true };
    appTree = await schematicRunner.runSchematicAsync('component', options, appTree).toPromise();
    const content = appTree.readContent('/projects/bar/src/app/sub/test/test.component.ts');
    expect(content).not.toMatch(/selector: 'app-test'/);
  });

  it('should respect the sourceRoot value', async () => {
    const config = JSON.parse(appTree.readContent('/angular.json'));
    config.projects.bar.sourceRoot = 'projects/bar/custom';
    appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));

    // should fail without a module in that dir
    await expect(schematicRunner.runSchematicAsync('container', defaultOptions, appTree).toPromise()).rejects;

    // move the module
    appTree.rename('/projects/bar/src/app/app.module.ts', '/projects/bar/custom/app/app.module.ts');
    appTree = await schematicRunner.runSchematicAsync('container', defaultOptions, appTree).toPromise();
    expect(appTree.files).toEqual(expect.arrayContaining(['/projects/bar/custom/app/foo/foo.container.ts']));
  });

  // testing deprecating options don't cause conflicts
  it('should respect the deprecated styleext (scss) option', async () => {
    const options = { ...defaultOptions, style: undefined, styleext: 'scss' };
    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const files = tree.files;
    expect(files).toEqual(expect.arrayContaining(['/projects/bar/src/app/foo/foo.container.scss']));
  });

  it('should respect the deprecated styleext (css) option', async () => {
    const options = { ...defaultOptions, style: undefined, styleext: 'css' };
    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const files = tree.files;
    expect(files).toEqual(expect.arrayContaining(['/projects/bar/src/app/foo/foo.container.css']));
  });

  it('should respect the deprecated spec option when false', async () => {
    const options = { ...defaultOptions, skipTests: undefined, spec: false };
    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const files = tree.files;
    expect(files).not.toEqual(expect.arrayContaining(['/projects/bar/src/app/foo/foo.container.spec.ts']));
  });

  it('should respect the deprecated spec option when true', async () => {
    const options = { ...defaultOptions, skipTests: false, spec: true };
    const tree = await schematicRunner.runSchematicAsync('container', options, appTree).toPromise();
    const files = tree.files;
    expect(files).toEqual(expect.arrayContaining(['/projects/bar/src/app/foo/foo.container.spec.ts']));
  });
});
