import { NgModule } from '@angular/core';<% if (commonModule) { %>
import { CommonModule } from '@angular/common';<% } %><% if (routing) { %>

import { <%= classify(name) %>RoutingModule } from './<%= dasherize(name) %>-routing.module';<% } %>
<% if (container) { %>import { <%= classify(name) %>Container } from './containers/<%= dasherize(name) %>-container/<%= dasherize(name) %>.container'; <% } %>

@NgModule({
  imports: [<% if (commonModule) { %>
    CommonModule<%= routing ? ',' : '' %><% } %><% if (routing) { %>
    <%= classify(name) %>RoutingModule<% } %>
  ],
  declarations: [ <% if (container) { %><%= classify(name) %>Container <% } %> ]
})
export class <%= classify(name) %>Module { }
