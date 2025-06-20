import { Component } from '@angular/core';
import { ChatComponent } from './components/chat/chat.component';
import { MealListComponent } from './components/meal-list/meal-list.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';

@Component({
  selector: 'app-root',
  imports: [
    UserSettingsComponent,
    MealListComponent,
    ChatComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dietgen-frontend';
}
