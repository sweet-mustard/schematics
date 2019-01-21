import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { Schema as NgNewOptions } from './schema';


describe('Ng New Schematic', () => {
    const schematicRunner = new SchematicTestRunner(
        '@sweet-mustard/schematics',
        require.resolve('../collection.json'),
    );
    const defaultOptions: NgNewOptions = {
        name: 'foo',
        directory: 'bar',
        version: '6.0.0',
    };

    it('should create files of a workspace', () => {
        const options = { ...defaultOptions };

        const tree = schematicRunner.runSchematic('ng-new', options);
        const files = tree.files;
        expect(files).toContain('/bar/angular.json');
    });

    it('should create files of an application', () => {
        const options = { ...defaultOptions };

        const tree = schematicRunner.runSchematic('ng-new', options);
        const files = tree.files;
        expect(files).toEqual(jasmine.arrayContaining([
            '/bar/src/tsconfig.app.json',
            '/bar/src/main.ts',
            '/bar/src/app/app.module.ts',
        ]));
    });

    it('should should set the prefix in angular.json and in app.component.ts', () => {
        const options = { ...defaultOptions, prefix: 'pre' };

        const tree = schematicRunner.runSchematic('ng-new', options);
        const content = tree.readContent('/bar/angular.json');
        expect(content).toMatch(/"prefix": "pre"/);
    });

    it('should set up the app module', () => {
        const options: NgNewOptions = {
            name: 'foo',
            version: '6.0.0',
        };

        const tree = schematicRunner.runSchematic('ng-new', options);
        const moduleContent = tree.readContent('/foo/src/app/app.module.ts');
        expect(moduleContent).toMatch(/declarations:\s*\[\s*RootContainer\s*\]/m);
    });

    it('createApplication=false should create an empty workspace', () => {
        const options = { ...defaultOptions, createApplication: false };

        const tree = schematicRunner.runSchematic('ng-new', options);
        const files = tree.files;
        expect(files).toContain('/bar/angular.json');
        expect(files).not.toContain('/bar/src');
    });
});