import { Component, input } from '@angular/core';
import { ConsoleEntry } from '../../models/ide.models';

@Component({
  imports: [],
  selector: 'app-console-panel',
  styleUrl: './console-panel.sass',
  templateUrl: './console-panel.html',
})
export class ConsolePanel {
  readonly entries = input<ConsoleEntry[]>([]);
}
