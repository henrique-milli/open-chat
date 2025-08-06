import { Component } from '@angular/core';
import {Chat} from '../chat/chat';
import {MatButton, MatFabButton, MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-layout',
  imports: [
    Chat,
    MatIconButton,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

}
