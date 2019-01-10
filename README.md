# Sweet Angular schematics

## How to contribute

Begin by cloning this repo, go to the root-folder and run `npm install`.
After that, you are ready to contribute.

### Testing your modifications

1. *Install* dependencies globally: `npm install -g @angular-devkit/core @angular-devkit/schematics @schematics/angular typescript`
2. *Build* your schematic local: `npm run build`
3. *Link* your *local build*: `npm install -g sweet-mustard-schematics-${version}.tgz`
4. *Build* a new *project* (see step 1 of 'how to use') and/or *link* the *schematics* to your demo project: `npm link @sweet-mustard/schematics`

## How to use
### Step 1: Setup a new project

To generate a new project with the Sweet Mustard guidelines already in place, run `ng new name --collection=@sweet-mustard/schematics --moduleName=${nameModule}`. The moduleName flag is for defining your first module next to the app-module.

### Step 2: Use

Now you have serveral commands at your disposal to generate new parts of your application:

- *Module (default with routing and sandbox):* `ng g module ${name}`
- *Sandbox:* `ng g andbox ${name}`
- *Container:* `ng g container ${name}`