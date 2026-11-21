import { Component, input } from '@angular/core';
import { ConsoleEntry } from '../../models/ide.models';

@Component({
  selector: 'app-console-panel',
  templateUrl: './console-panel.html',
  styleUrl: './console-panel.sass'
})
export class ConsolePanel {
  readonly entries = input<ConsoleEntry[]>([]);
  readonly plainTextMode = input<boolean>(false);
}