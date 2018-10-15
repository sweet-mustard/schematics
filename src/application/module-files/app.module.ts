import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
<% if (routing) { %>
import { AppRoutingModule } from './app-routing.module';<% } %>
import { AppComponent } from './containers/root/app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [<% if (!experimentalIvy) { %>
    BrowserModule<% if (routing) { %>,
    AppRoutingModule<% } %>
  <% } %>],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
