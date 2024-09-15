import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ElectronService } from '../../services/electron-service';
import { GeneratingLoaderComponent } from '../generating-loader/generating-loader.component';

export interface IAssistantData {
  role?: string,
  content: string,
  refusal?: null
}


@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GeneratingLoaderComponent
  ],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit {
  // http = inject(HttpClient);
  electronService = inject(ElectronService);
  cdr = inject(ChangeDetectorRef);


  messages: { text: string, sender: string }[] = [];
  userInput: string = '';
  isChatbotTyping: boolean = false;
  typingIntervalId: any;

  sendMessage() {
    const message = this.userInput.trim();
    if (message === '') return;

    this.displayUserMessage(message);
    this.userInput = '';

    this.isChatbotTyping = true;

    this.electronService.messageHttpRequest(message).then((response) => {
      console.log('Response:', response);
      this.isChatbotTyping = false;
      this.displayChatbotMessage(response);
    }).catch((error) => {
      console.error('Error:', error);
      this.isChatbotTyping = false;
    });
  }

  ngOnInit(): void {
    this.displayChatbotMessage({ content: `Hi, I'm a Chat Bot. What can I help you with today?` });
  }

  displayUserMessage(message: string): void {
    this.messages.push({ text: message, sender: 'user-message' });
    this.scrollChatToBottom();
  }

  displayChatbotMessage(data: IAssistantData): void {
    if (data) {
      this.isChatbotTyping = false;
      clearInterval(this.typingIntervalId);
      this.messages.push({ text: data.content, sender: 'chatbot-message' });

      this.cdr.detectChanges();

      this.scrollChatToBottom();
    }
  }

  private scrollChatToBottom(): void {
    const chatBody = document.getElementById('chat-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }
}
