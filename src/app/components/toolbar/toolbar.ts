import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-toolbar',
  styleUrl: './toolbar.sass',
  templateUrl: './toolbar.html',
})
export class Toolbar {
  readonly isDark = input<boolean>(true);
  readonly errorCount = input<number>(0);

  readonly runClicked = output<void>();
  readonly clearClicked = output<void>();
  readonly themeToggled = output<void>();
}
