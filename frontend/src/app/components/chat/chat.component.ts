import { Component, inject, OnInit } from '@angular/core';
import { MealGenerationService } from '../../services/meal-generation.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ChatServiceService } from '../../services/chat-service.service';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule, 
    NgIf,
    NgFor,
    NgClass
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  private chatService = inject(ChatServiceService);
  private mealGenerationService = inject(MealGenerationService);

  messages: ChatMessage[] = [];
  input: string = '';
  isLoading = false;

  constructor() {}

  ngOnInit(): void {
    // Optionally, load chat history from localStorage if you want persistence
  }

  sendMessage(event: Event) {
    event.preventDefault();
    const userMessage = this.input.trim();
    if (!userMessage) return;
    this.messages.push({ role: 'user', content: userMessage });
    this.input = '';
    this.isLoading = true;

    const existingMeals = this.mealGenerationService.getSavedMeals();

    this.chatService.sendChatMessage(userMessage, existingMeals).subscribe({
      next: (data) => {
        console.log(data);
        let botReply = 'Okay!';
        if (data && data.name) {
          botReply = `Meal updated: ${data.name}`;
        } else if (data && data.message) {
          botReply = data.message;
        }
        this.messages.push({ role: 'bot', content: botReply });
        this.isLoading = false;
      },
      error: (err) => {
        this.messages.push({ role: 'bot', content: 'Sorry, there was an error.' });
        this.isLoading = false;
      }
    });
  }
}
