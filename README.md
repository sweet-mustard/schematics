# Sweet Angular Schematics

> Angular Schematics with a Sweet Mustard flavour.


## How to use

### Step 1: Install

Install our schematics globally with `npm install -g @sweet-mustard/schematics`.

### Step 2: Setup a new project

To generate a new project with the Sweet Mustard guidelines already in place, run `ng new name --collection=@sweet-mustard/schematics --moduleName=${nameModule}`. The moduleName flag is for defining your first module next to the app-module.

### Step 3: Use

Now you have serveral commands at your disposal to generate new parts of your application:

- *Module (default with routing and sandbox):* `ng g @sweet-mustard/schematics:module ${name}`
- *Sandbox:* `ng g @sweet-mustard/schematics:sandbox ${name}`
- *Container:* `ng g @sweet-mustard/schematics:container ${name}`


## How to contribute

Begin by cloning this repo, go to the root-folder and run `npm install`.
After that, you are ready to test and contribute.

### Testing your modifications

1. *Build* your schematic local: `npm run build`
2. *Link* your *local build*: `npm link`
3. *Build* a new *project* (see step 2 of 'how to use') and/or *link* the *schematics* to your demo project: `npm link @sweet-mustard/schematics`

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.
