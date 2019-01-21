import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '../application/schema';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { Schema as ModuleOptions } from './schema';

describe('Module Schematic', () => {
    const schematicRunner = new SchematicTestRunner(
        '@sweet/schematics',
        require.resolve('../collection.json'),
    );
    const defaultOptions: ModuleOptions = {
        name: 'foo',
        module: undefined,
        flat: false,
        project: 'bar',
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

    it('should create a module', () => {
        const options = { ...defaultOptions };

        const tree = schematicRunner.runSchematic('module', options, appTree);
        const files = tree.files;
        expect(files).toEqual(expect.arrayContaining([
            '/projects/bar/src/app/foo/foo.module.ts',
            '/projects/bar/src/app/foo/containers/foo/foo.container.ts',
            '/projects/bar/src/app/foo/containers/foo/foo.container.spec.ts',
            '/projects/bar/src/app/foo/containers/foo/foo.container.scss',
            '/projects/bar/src/app/foo/containers/foo/foo.container.html',
            '/projects/bar/src/app/foo/components/.folderkeep'
        ]));
    });

    it('should import into another module', () => {
        const options = { ...defaultOptions, module: 'app.module.ts' };

        const tree = schematicRunner.runSchematic('module', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(content).toMatch(/import { FooModule } from '.\/foo\/foo.module'/);
        expect(content).toMatch(/imports: \[[^\]]*FooModule[^\]]*\]/m);
    });

    it('should import into another module when using flat', () => {
        const options = { ...defaultOptions, flat: true, module: 'app.module.ts' };

        const tree = schematicRunner.runSchematic('module', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/app.module.ts');
        expect(content).toMatch(/import { FooModule } from '.\/foo.module'/);
        expect(content).toMatch(/imports: \[[^\]]*FooModule[^\]]*\]/m);
    });

    it('should import into another module (deep)', () => {
        let tree = appTree;

        tree = schematicRunner.runSchematic('module', {
            ...defaultOptions,
            path: 'projects/bar/src/app/sub1',
            name: 'test1',
        }, tree);
        tree = schematicRunner.runSchematic('module', {
            ...defaultOptions,
            path: 'projects/bar/src/app/sub2',
            name: 'test2',
            module: '../sub1/test1',
        }, tree);

        const content = tree.readContent('/projects/bar/src/app/sub1/test1/test1.module.ts');
        expect(content).toMatch(/import { Test2Module } from '..\/..\/sub2\/test2\/test2.module'/);
    });

    it('should create a routing module', () => {
        const options = { ...defaultOptions, routing: true };

        const tree = schematicRunner.runSchematic('module', options, appTree);
        const files = tree.files;
        expect(files).toContain('/projects/bar/src/app/foo/foo.module.ts');
        expect(files).toContain('/projects/bar/src/app/foo/foo-routing.module.ts');
        const moduleContent = tree.readContent('/projects/bar/src/app/foo/foo.module.ts');
        expect(moduleContent).toMatch(/import { FooRoutingModule } from '.\/foo-routing.module'/);
        const routingModuleContent = tree.readContent('/projects/bar/src/app/foo/foo-routing.module.ts');
        expect(routingModuleContent).toMatch(/RouterModule.forChild\(routes\)/);
    });

    it('should dasherize a name', () => {
        const options = { ...defaultOptions, name: 'TwoWord' };

        const tree = schematicRunner.runSchematic('module', options, appTree);
        const files = tree.files;
        expect(files).toContain('/projects/bar/src/app/two-word/two-word.module.ts');
    });

    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        appTree = schematicRunner.runSchematic('module', defaultOptions, appTree);
        expect(appTree.files).toContain('/projects/bar/custom/app/foo/foo.module.ts');
    });
});