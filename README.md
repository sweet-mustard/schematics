# Sweet schematics
> Angular Schematics with a Sweet Mustard flavour.

## How to use

### Step 1: Install

Install our schematics globally with `npm install -g @sweet-mustard/schematics`.

### Step 2: Setup a new project

To generate a new project with the Sweet Mustard guidelines already in place, run `ng new name --collection=@sweet-mustard/schematics --moduleName=${nameModule}`. The moduleName flag is for defining your first module next to the app-module.

### Step 3: Use

Now you have several commands at your disposal to generate new parts of your application:

- *Module (default with routing and sandbox):* `ng g module ${name}` or `ng g swm ${name}`
- *Sandbox:* `ng g sandbox ${name}` or `ng g sws ${name}`
- *Container:* `ng g container ${name}` or `ng g swc ${name}`

## How to contribute

Begin by cloning this repo, go to the root-folder and run `npm install`.
After that, you are ready to contribute.

### Testing your modifications

1. *Build* your schematic local: `npm run build`
2. *Link* your *local build*: `npm install -g sweet-mustard-schematics-${version}.tgz`
3. *Build* a new *project* (see step 1 of 'how to use') and/or *link* the *schematics* to your demo project: `npm link @sweet-mustard/schematics`