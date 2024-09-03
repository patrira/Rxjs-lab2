import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component'; // Import your SearchComponent

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent // Declare your SearchComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule // Add HttpClientModule to imports
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
