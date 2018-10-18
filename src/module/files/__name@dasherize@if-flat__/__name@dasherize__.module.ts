import { NgModule } from '@angular/core'; <% if (commonModule) { %>
import { CommonModule } from '@angular/common'; <% } %> <% if (routing) { %>

import { <%= classify(name) %>RoutingModule } from './<%= dasherize(name) %>-routing.module'; <% } %>
<% if (container) { %>import { <%= classify(name) %>Container } from './containers/<%= dasherize(name) %>/<%= dasherize(name) %>.container'; <% } %>
<% if (sandbox) { %>import { <%= classify(name) %>Sandbox } from './sandbox/<%= dasherize(name) %>.sandbox'; <% } %>

@NgModule({
    imports: [<% if(commonModule) { %>
        CommonModule <%= routing ? ',' : '' %> <% } %> <% if (routing) { %>
            <%= classify(name) %>RoutingModule <% } %>
  ],
  declarations: [<% if (container) { %> <%= classify(name) %>Container <% } %> ],
  providers: [<% if(sandbox) { %> <%= classify(name)%>Sandbox <% } %> ]
})
export class <%= classify(name) %>Module { }
