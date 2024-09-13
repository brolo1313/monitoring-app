import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit {
  // http = inject(HttpClient);

  messages: { text: string, sender: string }[] = [];
  userInput: string = '';
  isChatbotTyping: boolean = false;
  typingIndicatorMessage: string = 'Typing';
  typingIntervalId: any;


  ngOnInit(): void {
    this.displayChatbotMessage("Hi, I'm a Chat Bot. What can I help you with today?");
  }

  displayUserMessage(message: string): void {
    this.messages.push({ text: message, sender: 'user-message' });
    this.scrollChatToBottom();
  }

  displayChatbotMessage(message: string): void {
    this.isChatbotTyping = false;
    clearInterval(this.typingIntervalId);
    this.messages.push({ text: message, sender: 'chatbot-message' });
    this.scrollChatToBottom();
  }

  displayTypingIndicator(): void {
    if (!this.isChatbotTyping) {
      this.isChatbotTyping = true;
      this.typingIndicatorMessage = 'Typing';
      this.typingIntervalId = setInterval(() => {
        this.typingIndicatorMessage = this.typingIndicatorMessage === 'Typing...' ? 'Typing' : this.typingIndicatorMessage + '.';
      }, 400);
    }
  }

  sendMessage(): void {
    const message = this.userInput.trim();
    if (message === '') return;

    this.displayUserMessage(message);
    this.userInput = ''; // Clear input field

    this.displayTypingIndicator();

    // this.http.post<any>('http://127.0.0.1:3000/message', { message: message })
    //   .subscribe(
    //     response => {
    //       this.displayChatbotMessage(response.message);
    //     },
    //     error => {
    //       console.error('Error:', error);
    //     }
    //   );
  }

  private scrollChatToBottom(): void {
    const chatBody = document.getElementById('chat-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }
}
