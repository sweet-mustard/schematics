**How to use**
clone repository
npm run build
npm link

ng new {uw naam} --collection=@schematics/sweet-mustard
De rest werkt zoals een normaal angular project

Wil je de schematics gebruiken voor containers,modules,sandbox aan te maken?

npm link @schematics/sweet-mustard

Container: ng g @schematics/sweet-mustard:container {uw naam/path}
Modules : ng g @schematics/sweet-mustard:module {uw naam/path}
Modules met routing: ng g @schematics/sweet-mustard:module {uw naam/path} --routing
Modules met sandbox: ng g @schematics/sweet-mustard:module {uw naam/path} --sandbox
Sandbox: ng g @schematics/sweet-mustard:sandbox {uw naam/path}