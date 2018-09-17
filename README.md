# How to use

First clone the repository local.

## In the project folder:

npm run build

npm link

## In a new project

ng new name --collection=@schematics/sweet-mustard --moduleName=nameModule

moduleName flag is for setting a demo module

## In your angular project:

npm link @schematics/sweet-mustard

### Generating a sandbox:

ng g @schematics/sweet-mustard:sandbox name

### Generating a container:

ng g @schematics/sweet-mustard:container name

### Generating a module, default with routing and sandbox:

ng g @schematics/sweet-mustard:module name
