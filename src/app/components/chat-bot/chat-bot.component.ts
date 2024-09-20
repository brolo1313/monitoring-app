import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElectronService } from '../../services/electron-service';
import { GeneratingLoaderComponent } from '../generating-loader/generating-loader.component';
import { marked } from 'marked';

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
  styleUrls: ['./chat-bot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit {
  electronService = inject(ElectronService);
  cdr = inject(ChangeDetectorRef);

  messages: { text: string, sender: string, htmlContent?: string }[] = [];
  userInput: string = '';
  isChatbotTyping: boolean = false;
  typingIntervalId: any;

  promptsPresets = [
    {
      message: 'Example table',
      icon: 'assets/icons/chat-bot/table-preset-icon.svg',
      id: 'table'
    },
    {
      message: 'Example list',
      icon: 'assets/icons/chat-bot/list-preset-icon.svg',
      id: 'list'
    }
  ]

  sendMessage() {
    const message = this.userInput.trim();
    if (message === '') return;

    this.displayUserMessage(message);
    this.userInput = '';

    this.isChatbotTyping = true;

    this.electronService.messageHttpRequest(message).then((response) => {
      this.isChatbotTyping = false;
      const markdownHTML = marked(response.content);

      this.displayChatbotMessage({ ...response, htmlContent: markdownHTML });
    }).catch((error) => {
      console.error('Error:', error);
      this.isChatbotTyping = false;
    });
  }

  ngOnInit(): void {
    this.displayChatbotMessage({ content: `Hi, I'm a Chat Bot. What can I help you with today?`, htmlContent: marked(`Hi, I'm a Chat Bot. What can I help you with today?`) });
  }

  displayUserMessage(message: string): void {
    this.messages.push({ text: message, sender: 'user-message' });
    this.scrollChatToBottom();
  }

  displayChatbotMessage(data: IAssistantData & { htmlContent?: string | any }): void {
    if (data) {
      this.isChatbotTyping = false;
      clearInterval(this.typingIntervalId);
      this.messages.push({ text: data.content, sender: 'chatbot-message', htmlContent: data.htmlContent });

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
