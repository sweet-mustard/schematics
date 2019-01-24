import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '../application/schema';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { Schema as SandboxOptions } from './schema';

describe('Sandbox Schematic', () => {
    const schematicRunner = new SchematicTestRunner(
        '@sweet-mustard/schematics',
        require.resolve('../collection.json'),
    );
    const defaultOptions: SandboxOptions = {
        name: 'foo',
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
        skipPackageJson: false,
    };
    let appTree: UnitTestTree;
    beforeEach(() => {
        appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
        appTree = schematicRunner.runSchematic('application', appOptions, appTree);
    });

    it('should create a service', () => {
        const options = { ...defaultOptions };

        const tree = schematicRunner.runSchematic('sandbox', options, appTree);
        const files = tree.files;
        expect(files).toContain('/projects/bar/src/app/foo/foo.sandbox.spec.ts');
        expect(files).toContain('/projects/bar/src/app/foo/foo.sandbox.ts');
    });

    it('service should be tree-shakeable', () => {
        const options = { ...defaultOptions};

        const tree = schematicRunner.runSchematic('sandbox', options, appTree);
        const content = tree.readContent('/projects/bar/src/app/foo/foo.sandbox.ts');
        expect(content).toMatch(/providedIn: 'root'/);
    });

    it('should respect the spec flag', () => {
        const options = { ...defaultOptions, spec: false, name: 'foo-sandbox' };

        const tree = schematicRunner.runSchematic('sandbox', options, appTree);
        const files = tree.files;
        expect(files).toContain('/projects/bar/src/app/foo-sandbox/foo-sandbox.sandbox.ts');
        expect(files).not.toContain('/projects/bar/src/app/foo-sandbox/foo-sandbox.sandbox.spec.ts');
    });

    it('should respect the sourceRoot value', () => {
        const config = JSON.parse(appTree.readContent('/angular.json'));
        config.projects.bar.sourceRoot = 'projects/bar/custom';
        appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
        appTree = schematicRunner.runSchematic('sandbox', defaultOptions, appTree);
        expect(appTree.files).toContain('/projects/bar/custom/app/foo/foo.sandbox.ts');
    });
});