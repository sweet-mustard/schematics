import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
<% if (routing) { %>
import { AppRoutingModule } from './app-routing.module';<% } %>
import { RootContainer } from './containers/root/root.container';

@NgModule({
  declarations: [
    RootContainer
  ],
  imports: [<% if (!experimentalIvy) { %>
    BrowserModule<% if (routing) { %>,
    AppRoutingModule<% } %>
  <% } %>],
  providers: [],
  bootstrap: [RootContainer]
})
export class AppModule { }
