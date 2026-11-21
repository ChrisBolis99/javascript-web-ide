import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from './components/toolbar/toolbar';
import { CodeEditor } from './components/code-editor/code-editor';
import { ConsolePanel } from './components/console-panel/console-panel';
import { ConsoleEntry, ConsoleLevel } from './models/ide.models';

@Component({
  imports: [RouterOutlet, Toolbar, CodeEditor, ConsolePanel],
  selector: 'app-root',
  styleUrl: './app.sass',
  templateUrl: './app.html',
})
export class App {
  @ViewChild('editor') editorComponent?: CodeEditor;

  protected readonly title = signal('javascript-web-ide');
  protected readonly isDark = signal(true);
  protected readonly plainTextMode = signal(false);
  protected readonly errorCount = signal(0);
  protected readonly logs = signal<ConsoleEntry[]>([]);

  private nextLogId = 1;

  protected readonly starterCode = `// JavaScript Web IDE
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Alice"));
console.log("2 + 2 =", 2 + 2);
`;

  protected toggleTheme(): void {
    this.isDark.update((v) => !v);
  }

  protected togglePlainText(): void {
    this.plainTextMode.update((v) => !v);
  }

  protected clearConsole(): void {
    this.logs.set([]);
  }

  protected runCode(): void {
    const code = this.editorComponent?.getValue() ?? '';
    this.appendLog('log', '--- Running script ---');
    this.executeInSandbox(code);
  }

  private executeInSandbox(code: string): void {
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.display = 'none';

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      iframe.remove();
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'js-ide-sandbox') return;

      if (data.type === 'console') {
        this.appendLog(data.level, data.args.join(' '));
      } else if (data.type === 'done') {
        cleanup();
      }
    };

    window.addEventListener('message', handleMessage);

    const wrappedScript = `
      <script>
        (function() {
          const send = (level, args) => {
            parent.postMessage({
              source: 'js-ide-sandbox',
              type: 'console',
              level,
              args: args.map(a => {
                try {
                  return typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a);
                } catch {
                  return String(a);
                }
              })
            }, '*');
          };

          console.log = (...args) => send('log', args);
          console.warn = (...args) => send('warn', args);
          console.error = (...args) => send('error', args);

          window.onerror = (msg, _url, line) => {
            send('error', [line ? 'Line ' + line + ': ' + msg : String(msg)]);
          };

          try {
            ${code}
          } catch (err) {
            send('error', [err && err.stack ? err.stack : String(err)]);
          } finally {
            parent.postMessage({ source: 'js-ide-sandbox', type: 'done' }, '*');
          }
        })();
      <\/script>
    `;

    document.body.appendChild(iframe);
    iframe.srcdoc = wrappedScript;
  }

  private appendLog(level: ConsoleLevel, message: string): void {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    this.logs.update((prev) => [
      ...prev,
      { id: this.nextLogId++, level, message, time }
    ]);
  }
}