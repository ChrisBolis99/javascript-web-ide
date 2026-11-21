import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.sass'
})
export class Toolbar {
  readonly isDark = input<boolean>(true);
  readonly plainTextMode = input<boolean>(false);
  readonly errorCount = input<number>(0);

  readonly runClicked = output<void>();
  readonly clearClicked = output<void>();
  readonly themeToggled = output<void>();
  readonly plainTextToggled = output<void>();
}