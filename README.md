# Sweet Angular Schematics

> Angular Schematics with a Sweet Mustard flavour.


## How to use

### Step 1: Setup a new project with the Sweet Mustard Schematics

To generate a new project with the Sweet Mustard guidelines already in place, run `ng new name --collection=@sweet-mustard/schematics --moduleName=${nameModule}`. The moduleName flag is for defining your first module next to the app-module.

### Step 2: Link the schematics to the project

Link the schematics in your project by running `npm link @sweet-mustard/schematics` in the root of your project.

Now you have serveral commands at your disposal to generate new parts of your application:

- *Module (default with routing and sandbox):* `ng g @sweet-mustard/schematics:module ${name}`
- *Sandbox:* `ng g @sweet-mustard/schematics:sandbox ${name}`
- *Container:* `ng g @sweet-mustard/schematics:container ${name}`


## How to contribute

You can clone this repo and then go to the root-folder and run `npm install`. After that, you are ready to contribute.

### Testing your modifications

1. *Build* your schematic local: `npm run build`
2. *Link* your *local build*: `npm link`
3. *Link* the *schematics* to your demo project: `npm link @sweet-mustard/schematics`

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.
