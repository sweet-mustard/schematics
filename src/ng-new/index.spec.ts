import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { Schema as NgNewOptions } from './schema';

describe('Ng New Schematic', () => {
  const schematicRunner = new SchematicTestRunner('@sweet-mustard/schematics', require.resolve('../collection.json'));
  const defaultOptions: NgNewOptions = {
    name: 'foo',
    directory: 'bar',
    version: '6.0.0'
  };

  it('should create files of a workspace', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('ng-new', options).toPromise();
    const files = tree.files;
    expect(files).toContain('/bar/angular.json');
  });

  it('should create files of an application', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('ng-new', options).toPromise();
    const files = tree.files;
    expect(files).toContain([
      '/bar/src/tsconfig.app.json',
      '/bar/src/main.ts',
      '/bar/src/app/app.module.ts',
      '/bar/e2e/src/app.po.ts',
      '/bar/e2e/src/app.e2e-spec.ts',
      '/bar/e2e/tsconfig.json',
      '/bar/e2e/protractor.conf.js'
    ]);
  });

  it('should should set the prefix in angular.json and in app.component.ts', async () => {
    const options = { ...defaultOptions, prefix: 'pre' };

    const tree = await schematicRunner.runSchematicAsync('ng-new', options).toPromise();
    const content = tree.readContent('/bar/angular.json');
    expect(content).toMatch(/"prefix": "pre"/);
  });

  it('should set up the app module', async () => {
    const options: NgNewOptions = {
      name: 'foo',
      version: '6.0.0'
    };

    const tree = await schematicRunner.runSchematicAsync('ng-new', options).toPromise();
    const moduleContent = tree.readContent('/foo/src/app/app.module.ts');
    expect(moduleContent).toMatch(/declarations:\s*\[\s*RootContainer\s*\]/m);
  });

  it('createApplication=false should create an empty workspace', async () => {
    const options = { ...defaultOptions, createApplication: false };

    const tree = await schematicRunner.runSchematicAsync('ng-new', options).toPromise();
    const files = tree.files;
    expect(files).toContain('/bar/angular.json');
    expect(files).not.toContain('/bar/src');
  });
});
