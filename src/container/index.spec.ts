import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '../application/schema';
import { createAppModule } from '@schematics/angular/utility/test';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { Schema as ContainerOptions } from './schema';

describe('Component Schematic', () => {
    const schematicRunner = new SchematicTestRunner(
        '@sweet/schematics',
        require.resolve('../collection.json'),
    );
    const defaultOptions: ContainerOptions = {
        name: 'foo',
        inlineStyle: false,
        inlineTemplate: false,
        styleext: 'scss',
        module: undefined,
        export: false,
        project: 'bar'
    };


    const workspaceOptions: WorkspaceOptions = {
        name: 'workspace',
        newProjectRoot: 'projects',
        version: '6.0.0',
    };

    const appOptions: ApplicationOptions = {
        name: 'bar',
        inlineStyle: false,
        inlineTemplate: false,
        routing: false,
        style: 'css',
        skipTests: false,
        skipPackageJson: false,
    };
    let appTree: UnitTestTree;
    beforeEach(() => {
        appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
        appTree = schematicRunner.runSchematic('application', appOptions, appTree);
    });

    it('should create a component', () => {
        const options = { ...defaultOptions };
        const tree = schematicRunner.runSchematic('container', options, appTree);
        const files = tree.files;
        expect(files).toEqual(expect.arrayContaining([
            '/projects/bar/src/app/foo/foo.container.scss',
            '/projects/bar/src/app/foo/foo.container.html',
            '/projects/bar/src/app/foo/foo.container.spec.ts',
            '/projects/bar/src/app/foo/foo.container.ts',
        ]));
        const moduleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo-container\/foo.container'/);
        expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooContainer\r?\n/m);
    });

    it('should set change detection to OnPush', () => {
        const options = { ...defaultOptions, changeDetection: 'OnPush' };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(tsContent).toMatch(/changeDetection: ChangeDetectionStrategy.OnPush/);
    });

    it('should not set view encapsulation', () => {
        const options = { ...defaultOptions };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(tsContent).not.toMatch(/encapsulation: ViewEncapsulation/);
    });

    it('should set view encapsulation to Emulated', () => {
        const options = { ...defaultOptions, viewEncapsulation: 'Emulated' };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(tsContent).toMatch(/encapsulation: ViewEncapsulation.Emulated/);
    });

    it('should set view encapsulation to None', () => {
        const options = { ...defaultOptions, viewEncapsulation: 'None' };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const tsContent = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(tsContent).toMatch(/encapsulation: ViewEncapsulation.None/);
    });

    it('should create a flat component', () => {
        const options = { ...defaultOptions, flat: true };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const files = tree.files;
        expect(files).toEqual(expect.arrayContaining([
            '/projects/bar/src/app/foo.container.scss',
            '/projects/bar/src/app/foo.container.html',
            '/projects/bar/src/app/foo.container.spec.ts',
            '/projects/bar/src/app/foo.container.ts',
        ]));
    });

    it('should find the closest module', () => {
        const options = { ...defaultOptions };
        const fooModule = '/projects/bar/src/app/foo/foo.module.ts';
        appTree.create(fooModule, `
      import { NgModule } from '@angular/core';
      @NgModule({
        imports: [],
        declarations: []
      })
      export class FooModule { }
    `);

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const fooModuleContent = tree.readContent(fooModule);
        expect(fooModuleContent).toMatch(/import { FooContainer } from '..\/foo-container\/foo.container'/);
    });

    it('should export the component', () => {
        const options = { ...defaultOptions, export: true };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const appModuleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(appModuleContent).toMatch(/exports: \[FooContainer\]/);
    });

    it('should set the entry component', () => {
        const options = { ...defaultOptions, entryComponent: true };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const appModuleContent = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(appModuleContent).toMatch(/entryComponents: \[FooContainer\]/);
    });

    it('should import into a specified module', () => {
        const options = { ...defaultOptions, module: 'app.module.ts' };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const appModule = tree.readContent('/projects/bar/src/app/app.module.ts');

        expect(appModule).toMatch(/import { FooContainer } from '.\/foo-container\/foo.container'/);
    });

    it('should fail if specified module does not exist', () => {
        const options = { ...defaultOptions, module: '/projects/bar/src/app.moduleXXX.ts' };
        let thrownError: Error | null = null;
        try {
            schematicRunner.runSchematic('container', options, appTree);
        } catch (err) {
            thrownError = err;
        }
        expect(thrownError).toBeDefined();
    });

    it('should handle upper case paths', () => {
        const pathOption = 'projects/bar/src/app/SOME/UPPER/DIR';
        const options = { ...defaultOptions, path: pathOption };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        let files = tree.files;
        let root = `/${pathOption}/foo/foo.container`;
        expect(files).toEqual(expect.arrayContaining([
            `${root}.scss`,
            `${root}.html`,
            `${root}.spec.ts`,
            `${root}.ts`,
        ]));

        const options2 = { ...options, name: 'BAR' };
        const tree2 = schematicRunner.runSchematic('container', options2, tree);
        files = tree2.files;
        root = `/${pathOption}/bar/bar.container`;
        expect(files).toEqual(expect.arrayContaining([
            `${root}.scss`,
            `${root}.html`,
            `${root}.spec.ts`,
            `${root}.ts`,
        ]));
    });

    it('should create a component in a sub-directory', () => {
        const options = { ...defaultOptions, path: 'projects/bar/src/app/a/b/c' };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const files = tree.files;
        const root = `/${options.path}/foo/foo.container`;
        expect(files).toEqual(expect.arrayContaining([
            `${root}.scss`,
            `${root}.html`,
            `${root}.spec.ts`,
            `${root}.ts`,
        ]));
    });

    it('should use the prefix', () => {
        const options = { ...defaultOptions, prefix: 'pre' };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(content).toMatch(/selector: 'pre-foo'/);
    });

    it('should use the default project prefix if none is passed', () => {
        const options = { ...defaultOptions, prefix: undefined };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(content).toMatch(/selector: 'app-foo'/);
    });

    it('should use the supplied prefix if it is ""', () => {
        const options = { ...defaultOptions, prefix: '' };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(content).toMatch(/selector: 'foo'/);
    });

    it('should respect the inlineTemplate option', () => {
        const options = { ...defaultOptions, inlineTemplate: true };
        const tree = schematicRunner.runSchematic('container', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(content).toMatch(/template: /);
        expect(content).not.toMatch(/templateUrl: /);
        expect(tree.files).not.toContain('/projects/bar/src/app/foo/foo.container.html');
    });

    it('should respect the inlineStyle option', () => {
        const options = { ...defaultOptions, inlineStyle: true };
        const tree = schematicRunner.runSchematic('container', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(content).toMatch(/styles: \[/);
        expect(content).not.toMatch(/styleUrls: /);
        expect(tree.files).not.toContain('/projects/bar/src/app/foo/foo.container.css');
    });

    it('should respect the style option', () => {
        const options = { ...defaultOptions, style: 'scss' };
        const tree = schematicRunner.runSchematic('container', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.container.ts');
        expect(content).toMatch(/styleUrls: \['.\/foo.container.scss/);
        expect(tree.files).toContain('/projects/bar/src/app/foo/foo.container.scss');
        expect(tree.files).not.toContain('/projects/bar/src/app/foo/foo.container.css');
    });

    it('should use the module flag even if the module is a routing module', () => {
        const routingFileName = 'app-routing.module.ts';
        const routingModulePath = `/projects/bar/src/app/${routingFileName}`;
        const newTree = createAppModule(appTree, routingModulePath);
        const options = { ...defaultOptions, module: routingFileName };
        const tree = schematicRunner.runSchematic('container', options, newTree);
        const content = tree.readContent(routingModulePath);
        expect(content).toMatch(/import { FooContainer } from '.\/foo-container\/foo.container/);
    });

    it('should handle a path in the name option', () => {
        const options = { ...defaultOptions, name: 'dir/test-component' };

        const tree = schematicRunner.runSchematic('container', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(content).toMatch(
            /import { TestComponentContainer } from '\.\/dir\/test-component-container\/test-component.container'/);
    });

    it('should handle a path in the name and module options', () => {
        appTree = schematicRunner.runSchematic('module', { name: 'admin/module', project: 'bar' }, appTree);

        const options = { ...defaultOptions, name: 'other/test-component', module: 'admin/module' };
        appTree = schematicRunner.runSchematic('container', options, appTree);

        const content = appTree.readContent('/projects/bar/src/app/admin/module/module.module.ts');
        expect(content).toMatch(
            // tslint:disable-next-line:max-line-length
            /import { TestComponentContainer } from '..\/..\/other\/test-component-container\/test-component.container'/);
    });

    it('should create the right selector with a path in the name', () => {
        const options = { ...defaultOptions, name: 'sub/test' };
        appTree = schematicRunner.runSchematic('container', options, appTree);
        const content = appTree.readContent('/projects/bar/src/app/sub/test/test.container.ts');
        expect(content).toMatch(/selector: 'app-test'/);
    });

    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));

        // should fail without a module in that dir
        expect(() => schematicRunner.runSchematic('container', defaultOptions, appTree)).toThrow();

        // move the module
        appTree.rename('/projects/bar/src/app/app.module.ts', '/projects/bar/custom/app/app.module.ts');
        appTree = schematicRunner.runSchematic('container', defaultOptions, appTree);
        expect(appTree.files).toContain('/projects/bar/custom/app/foo/foo.container.ts');
    });

    // testing deprecating options don't cause conflicts
    it('should respect the deprecated styleext (scss) option', () => {
        const options = { ...defaultOptions, style: undefined, styleext: 'scss' };
        const tree = schematicRunner.runSchematic('container', options, appTree);
        const files = tree.files;
        expect(files).toContain('/projects/bar/src/app/foo/foo.container.scss');
    });

    it('should respect the deprecated styleext (css) option', () => {
        const options = { ...defaultOptions, style: undefined, styleext: 'scss' };
        const tree = schematicRunner.runSchematic('container', options, appTree);
        const files = tree.files;
        expect(files).toContain('/projects/bar/src/app/foo/foo.container.scss');
    });

    it('should respect the deprecated spec option when false', () => {
        const options = { ...defaultOptions, skipTests: undefined, spec: false };
        const tree = schematicRunner.runSchematic('container', options, appTree);
        const files = tree.files;
        expect(files).not.toContain('projects/bar/src/app/foo/foo.container.spec.ts');
    });

    it('should respect the deprecated spec option when true', () => {
        const options = { ...defaultOptions, skipTests: false, spec: true };
        const tree = schematicRunner.runSchematic('container', options, appTree);
        const files = tree.files;
        expect(files).toContain('/projects/bar/src/app/foo/foo.container.spec.ts');
    });

});