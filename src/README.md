# Sweet Angular Schematics

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
