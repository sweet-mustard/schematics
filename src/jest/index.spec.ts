import {SchematicTestRunner, UnitTestTree} from "@angular-devkit/schematics/testing";
import {Schema as JestOptions} from "./schema";
import {Schema as WorkspaceOptions} from "../workspace/schema";
import {Schema as ApplicationOptions} from "../application/schema";

describe('Jest schematic', () => {
    const schematicRunner = new SchematicTestRunner(
        '@sweet/schematics',
        require.resolve('../collection.json'),
    );

    const defaultOptions: JestOptions = {
        relatedAppName: 'foo'
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

    it('should create a setup jest file', () => {
        const options = { ...defaultOptions, projectRoot: 'jest' };
        const tree = schematicRunner.runSchematic('jest', options, appTree);
        const files = tree.files;
        expect(files).toEqual(expect.arrayContaining([
            '/jest/setupJest.ts'
        ]));
    });
});