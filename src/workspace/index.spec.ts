import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { latestVersions } from '@schematics/angular/utility/latest-versions';
import { Schema as WorkspaceOptions } from './schema';

describe('Workspace Schematic', () => {
  const schematicRunner = new SchematicTestRunner('@sweet-mustard/schematics', require.resolve('../collection.json'));
  const defaultOptions: WorkspaceOptions = {
    name: 'foo',
    version: '6.0.0'
  };

  it('should create all files of a workspace', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('workspace', options).toPromise();
    const files = tree.files;
    expect(files).toEqual(
      expect.arrayContaining([
        '/.editorconfig',
        '/angular.json',
        '/.gitignore',
        '/package.json',
        '/README.md',
        '/tsconfig.json',
        '/tslint.json',
        '/.prettierrc',
        '/.prettierignore',
        '/jest.config.js'
      ])
    );
  });

  it('should set the name in package.json', async () => {
    const tree = await schematicRunner.runSchematicAsync('workspace', defaultOptions).toPromise();
    const pkg = JSON.parse(tree.readContent('/package.json'));
    expect(pkg.name).toEqual('foo');
  });

  it('should set the CLI version in package.json', async () => {
    const tree = await schematicRunner.runSchematicAsync('workspace', defaultOptions).toPromise();
    const pkg = JSON.parse(tree.readContent('/package.json'));
    expect(pkg.devDependencies['@angular/cli']).toMatch('~8.3.20');
  });

  it('should use the latest known versions in package.json', async () => {
    const tree = await schematicRunner.runSchematicAsync('workspace', defaultOptions).toPromise();
    const pkg = JSON.parse(tree.readContent('/package.json'));
    expect(pkg.dependencies['@angular/core']).toEqual(latestVersions.Angular);
    expect(pkg.dependencies['rxjs']).toEqual(latestVersions.RxJs);
    expect(pkg.dependencies['zone.js']).toEqual(latestVersions.ZoneJs);
    expect(pkg.devDependencies['typescript']).toEqual(latestVersions.TypeScript);
  });
});
