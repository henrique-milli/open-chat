import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import * as webllm from '@mlc-ai/web-llm';
import {
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam
} from '@mlc-ai/web-llm';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
  ]
})
export class Chat implements OnInit {
  @ViewChild('userInput') userInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('chatBox') chatBoxRef!: ElementRef<HTMLDivElement>;
  DEFAULT_MODEL = 'SmolLM2-360M-Instruct-q4f16_1-MLC';

  availableModels: string[] = webllm.prebuiltAppConfig.model_list.map(m => m.model_id);
  // selectedModel = this.availableModels[0] || '';
  selectedModel = this.DEFAULT_MODEL;
  messages: ChatCompletionMessageParam[] = [
    { content: 'You are a helpful AI agent helping users.', role: 'system' }
  ];
  chatHistory: ChatCompletionMessageParam[] = [];
  engine = new webllm.MLCEngine();
  isLoading = false;
  downloadStatus = '';
  statsText = '';
  modelLoaded = false;

  ngOnInit() {
    console.debug('[Chat] ngOnInit');
    this.engine.setInitProgressCallback((report) => {
      this.downloadStatus = report.text;
      console.debug('[Chat] Download status update:', report.text);
    });
  }

  async initializeWebLLMEngine() {
    console.debug('[Chat] initializeWebLLMEngine called');
    this.isLoading = true;
    this.downloadStatus = '';
    this.modelLoaded = false;
    try {
      console.debug('[Chat] Reloading model:', this.selectedModel);
      await this.engine.reload(this.selectedModel, {temperature: 1.0, top_p: 1});
      console.debug('[Chat] Model reloaded successfully');
    } catch (e) {
      console.debug('[Chat] Error during model reload:', e);
      this.onError(e)
    }
    this.isLoading = false;
    this.modelLoaded = true;
    console.debug('[Chat] Model loaded:', this.modelLoaded);
  }

  async onMessageSend() {
    console.debug('[Chat] onMessageSend called');
    const input = this.userInputRef.nativeElement.value.trim();
    console.debug('[Chat] User input:', input);
    if (!input) return;
    this.userInputRef.nativeElement.value = '';
    this.userInputRef.nativeElement.placeholder = 'Generating...';
    const userMsg: ChatCompletionUserMessageParam = { content: input, role: 'user' };
    this.messages.push(userMsg);
    this.chatHistory.push(userMsg);
    console.debug('[Chat] User message pushed:', userMsg);
    // Add placeholder assistant message
    const aiMsg: ChatCompletionMessageParam = { content: 'typing...', role: 'assistant' };
    this.chatHistory.push(aiMsg);
    console.debug('[Chat] Assistant placeholder pushed:', aiMsg);
    await this.streamingGenerating(
      this.messages,
      (partial: string) => this.updateLastMessage(partial),
      (final: string) => this.onFinishGenerating(final),
      (e: Error) => this.onError(e)
    );
  }

  async streamingGenerating(
    messages: ChatCompletionMessageParam[],
    onUpdate: (partial: string) => void,
    onFinish: (final: string) => void,
    onError: (err: any) => void
  ) {
    console.debug('[Chat] streamingGenerating called with messages:', messages);
    try {
      let curMessage = '';
      const completion = await this.engine.chat.completions.create({
        stream: true,
        messages
      });
      for await (const chunk of completion) {
        const curDelta = chunk.choices[0].delta.content;
        if (curDelta) curMessage += curDelta;
        console.debug('[Chat] Streaming chunk received:', curDelta);
        onUpdate(curMessage);
      }
      const finalMessage = await this.engine.getMessage();
      console.debug('[Chat] Streaming finished, final message:', finalMessage);
      onFinish(finalMessage);
    } catch (e) {
      console.debug('[Chat] Error in streamingGenerating:', e);
      onError(e);
    }
  }

  updateLastMessage(content: string) {
    if (this.chatHistory.length > 0) {
      this.chatHistory[this.chatHistory.length - 1] = {
        content,
        role: 'assistant',
      };
    }
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  async onFinishGenerating(finalMessage: string) {
    this.updateLastMessage(finalMessage);
    this.userInputRef.nativeElement.placeholder = 'Type a message...';
    this.statsText = await this.engine.runtimeStatsText();
  }

  onError(err: any) {
    this.updateLastMessage('Error: ' + err);
    this.userInputRef.nativeElement.placeholder = 'Type a message...';
  }

  onModelChange(event: MatSelectChange) {
    this.selectedModel = event.value;
  }

  scrollToBottom() {
    if (this.chatBoxRef) {
      this.chatBoxRef.nativeElement.scrollTop = this.chatBoxRef.nativeElement.scrollHeight;
    }
  }
}
