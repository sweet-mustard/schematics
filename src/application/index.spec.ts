import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { latestVersions } from '@schematics/angular/utility/latest-versions';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { Schema as ApplicationOptions } from './schema';

describe('Application Schematic', () => {
  const schematicRunner = new SchematicTestRunner('@sweet-mustard/schematics', require.resolve('../collection.json'));

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0'
  };

  const defaultOptions: ApplicationOptions = {
    name: 'foo',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    skipPackageJson: false
  };

  let workspaceTree: UnitTestTree;

  beforeEach(async () => {
    workspaceTree = await schematicRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
  });

  it('should create all files of an application', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
    const files = tree.files;
    expect(files).toEqual(
      expect.arrayContaining([
        '/projects/foo/tsconfig.app.json',
        '/projects/foo/tsconfig.spec.json',
        '/projects/foo/tslint.json',
        '/projects/foo/src/environments/environment.ts',
        '/projects/foo/src/environments/environment.prod.ts',
        '/projects/foo/src/favicon.ico',
        '/projects/foo/src/index.html',
        '/projects/foo/src/main.ts',
        '/projects/foo/src/polyfills.ts',
        '/projects/foo/src/styles/app.scss',
        '/projects/foo/src/app/app.module.ts',
        '/projects/foo/src/app/containers/root/root.container.html',
        '/projects/foo/src/app/containers/root/root.container.spec.ts',
        '/projects/foo/src/app/containers/root/root.container.ts',
        '/projects/foo/src/app/containers/root/root.container.scss',
        '/projects/foo/src/modules/foo/foo.module.ts',
        '/projects/foo/src/modules/foo/containers/foo/foo.container.html',
        '/projects/foo/src/modules/foo/containers/foo/foo.container.spec.ts',
        '/projects/foo/src/modules/foo/containers/foo/foo.container.ts',
        '/projects/foo/src/modules/foo/containers/foo/foo.container.scss',
        '/projects/foo/src/modules/foo/sandbox/foo.sandbox.spec.ts',
        '/projects/foo/src/modules/foo/sandbox/foo.sandbox.ts',
        '/projects/foo/e2e/protractor.conf.js',
        '/projects/foo/e2e/tsconfig.json',
        '/projects/foo/e2e/src/app.e2e-spec.ts',
        '/projects/foo/e2e/src/app.po.ts'
      ])
    );
  });

  it('should add the application to the workspace', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
    const workspace = JSON.parse(tree.readContent('/angular.json'));
    expect(workspace.projects.foo).toBeDefined();
    expect(workspace.defaultProject).toBe('foo');
  });

  it('should set the prefix to app if none is set', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
    const workspace = JSON.parse(tree.readContent('/angular.json'));
    expect(workspace.projects.foo.prefix).toEqual('app');
  });

  it('should set the prefix correctly', async () => {
    const options = { ...defaultOptions, prefix: 'pre' };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
    const workspace = JSON.parse(tree.readContent('/angular.json'));
    expect(workspace.projects.foo.prefix).toEqual('pre');
  });

  it('should handle the routing flag', async () => {
    const options = { ...defaultOptions, routing: true };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
    const files = tree.files;
    expect(files).toContain('/projects/foo/src/app/app.module.ts');
    expect(files).toContain('/projects/foo/src/app/app-routing.module.ts');
    const moduleContent = tree.readContent('/projects/foo/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import { AppRoutingModule } from '.\/app-routing.module'/);
    const routingModuleContent = tree.readContent('/projects/foo/src/app/app-routing.module.ts');
    expect(routingModuleContent).toMatch(/RouterModule.forRoot\(routes\)/);
  });

  it('should import BrowserModule in the app module', async () => {
    const tree = await schematicRunner.runSchematicAsync('application', defaultOptions, workspaceTree).toPromise();
    const path = '/projects/foo/src/app/app.module.ts';
    const content = tree.readContent(path);
    expect(content).toMatch(/import { BrowserModule } from \'@angular\/platform-browser\';/);
  });

  it('should declare app component in the app module', async () => {
    const tree = await schematicRunner.runSchematicAsync('application', defaultOptions, workspaceTree).toPromise();
    const path = '/projects/foo/src/app/app.module.ts';
    const content = tree.readContent(path);
    expect(content).toMatch(/import\s{\sRootContainer\s}\sfrom\s\'\.\/containers\/root\/root\.container/);
  });

  it('should set the right paths in the tsconfig files', async () => {
    const tree = await schematicRunner.runSchematicAsync('application', defaultOptions, workspaceTree).toPromise();
    let path = '/projects/foo/tsconfig.app.json';
    let content = tree.readContent(path);
    expect(content).toMatch('../../tsconfig.json');
    path = '/projects/foo/tsconfig.spec.json';
    content = tree.readContent(path);
    expect(content).toMatch('../../tsconfig.json');
    const specTsConfig = JSON.parse(content);
    expect(specTsConfig.files).toEqual(['src/polyfills.ts']);
  });

  it('should set the right path and prefix in the tslint file', async () => {
    const tree = await schematicRunner.runSchematicAsync('application', defaultOptions, workspaceTree).toPromise();
    const path = '/projects/foo/tslint.json';
    const content = JSON.parse(tree.readContent(path));
    expect(content.extends).toMatch('../../tslint.json');
    expect(content.rules['directive-selector'][2]).toMatch('app');
    expect(content.rules['component-selector'][2]).toMatch('app');
  });

  describe(`update package.json`, () => {
    it(`should add build-angular to devDependencies`, async () => {
      const tree = await schematicRunner.runSchematicAsync('application', defaultOptions, workspaceTree).toPromise();

      const packageJson = JSON.parse(tree.readContent('package.json'));
      expect(packageJson.devDependencies['@angular-devkit/build-angular']).toEqual(latestVersions.DevkitBuildAngular);
    });

    it('should use the latest known versions in package.json', async () => {
      const tree = await schematicRunner.runSchematicAsync('application', defaultOptions, workspaceTree).toPromise();
      const pkg = JSON.parse(tree.readContent('/package.json'));
      expect(pkg.devDependencies['@angular/compiler-cli']).toEqual(latestVersions.Angular);
      expect(pkg.devDependencies['typescript']).toEqual(latestVersions.TypeScript);
    });

    it(`should not override existing users dependencies`, async () => {
      const oldPackageJson = workspaceTree.readContent('package.json');
      workspaceTree.overwrite(
        'package.json',
        oldPackageJson.replace(`"typescript": "${latestVersions.TypeScript}"`, `"typescript": "~2.5.2"`)
      );

      const tree = await schematicRunner.runSchematicAsync('application', defaultOptions, workspaceTree).toPromise();
      const packageJson = JSON.parse(tree.readContent('package.json'));
      expect(packageJson.devDependencies.typescript).toEqual('~2.5.2');
    });

    it(`should not modify the file when --skipPackageJson`, async () => {
      const tree = await schematicRunner
        .runSchematicAsync(
          'application',
          {
            name: 'foo',
            skipPackageJson: true
          },
          workspaceTree
        )
        .toPromise();

      const packageJson = JSON.parse(tree.readContent('package.json'));
      expect(packageJson.devDependencies['@angular-devkit/build-angular']).toBeUndefined();
    });
  });

  describe('custom projectRoot', () => {
    it('should put app files in the right spot', async () => {
      const options = { ...defaultOptions, projectRoot: '' };

      const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
      const files = tree.files;
      expect(files).toEqual(
        expect.arrayContaining([
          '/tsconfig.app.json',
          '/tsconfig.spec.json',
          '/tslint.json',
          '/src/environments/environment.ts',
          '/src/environments/environment.prod.ts',
          '/src/favicon.ico',
          '/src/index.html',
          '/src/main.ts',
          '/src/polyfills.ts',
          '/src/styles/app.scss',
          '/src/app/app.module.ts',
          '/src/app/containers/root/root.container.scss',
          '/src/app/containers/root/root.container.html',
          '/src/app/containers/root/root.container.spec.ts',
          '/src/app/containers/root/root.container.ts'
        ])
      );
    });

    it('should set values in angular.json correctly', async () => {
      const options = { ...defaultOptions, projectRoot: '' };

      const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
      const config = JSON.parse(tree.readContent('/angular.json'));
      const prj = config.projects.foo;
      expect(prj.root).toEqual('');
      const buildOpt = prj.architect.build.options;
      expect(buildOpt.index).toEqual('src/index.html');
      expect(buildOpt.main).toEqual('src/main.ts');
      expect(buildOpt.polyfills).toEqual('src/polyfills.ts');
      expect(buildOpt.tsConfig).toEqual('tsconfig.app.json');
    });

    it('should set the relative tsconfig paths', async () => {
      const options = { ...defaultOptions, projectRoot: '' };

      const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
      const appTsConfig = JSON.parse(tree.readContent('/tsconfig.app.json'));
      expect(appTsConfig.extends).toEqual('./tsconfig.json');
      const specTsConfig = JSON.parse(tree.readContent('/tsconfig.spec.json'));
      expect(specTsConfig.extends).toEqual('./tsconfig.json');
      expect(specTsConfig.files).toEqual(['src/polyfills.ts']);
    });

    it('should set the relative path and prefix in the tslint file', async () => {
      const options = { ...defaultOptions, projectRoot: '' };

      const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree).toPromise();
      const content = JSON.parse(tree.readContent('/tslint.json'));
      expect(content.extends).toMatch('tslint:recommended');
      expect(content.rules['directive-selector'][2]).toMatch('app');
      expect(content.rules['component-selector'][2]).toMatch('app');
    });
  });
});
