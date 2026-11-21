import { AfterViewInit, Component, effect, ElementRef, input, OnDestroy, output, ViewChild } from '@angular/core';

declare const require: {
  config: (cfg: { paths: Record<string, string> }) => void;
  (deps: string[], callback: (...args: any[]) => void): void;
}

@Component({
  imports: [],
  selector: 'app-code-editor',
  styleUrl: './code-editor.sass',
  templateUrl: './code-editor.html',
})
export class CodeEditor implements AfterViewInit, OnDestroy {
  @ViewChild('editorHost') editorHost!: ElementRef<HTMLDivElement>;

  readonly initialCode = input<string>('');
  readonly isDark = input<boolean>(true);
  readonly errorCountChange = output<number>();

  private monacoRef: any;
  private editorInstance: any;
  private markerDisposable: any;

  constructor() {
    effect(() => {
      const dark = this.isDark();
      if (this.monacoRef) {
        this.monacoRef.editor.setTheme(dark ? 'vs-dark' : 'vs');
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadMonaco();
  }

  getValue(): string {
    return this.editorInstance?.getValue() ?? '';
  }

  private loadMonaco(): void {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-monaco-loader]');
    if (existingScript && typeof require !== 'undefined') {
      this.initEditor();
      return;
    }

    const script = document.createElement('script');
    script.src = 'vs/loader.js';
    script.dataset['monacoLoader'] = 'true';
    script.onload = () => this.initEditor();
    document.body.appendChild(script);
  }

  private initEditor(): void {
    require.config({ paths: { vs: 'vs' } });
    require(['vs/editor/editor.main'], (monaco: any) => {
      this.monacoRef = monaco;
      this.editorInstance = monaco.editor.create(this.editorHost.nativeElement, {
        value: this.initialCode(),
        language: 'javascript',
        theme: this.isDark() ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14
      });

      const model = this.editorInstance.getModel();
      this.emitErrorCount(model);

      this.markerDisposable = monaco.editor.onDidChangeMarkers((uris: any[]) => {
        if (model && uris.some((u) => u.toString() === model.uri.toString())) {
          this.emitErrorCount(model);
        }
      });
    });
  }

  private emitErrorCount(model: any): void {
    if (!this.monacoRef || !model) return;
    const markers = this.monacoRef.editor.getModelMarkers({ resource: model.uri });
    const errors = markers.filter((m: any) => m.severity === this.monacoRef.MarkerSeverity.Error);
    this.errorCountChange.emit(errors.length);
  }

  ngOnDestroy(): void {
    this.markerDisposable?.dispose();
    this.editorInstance?.dispose();
  }
}
