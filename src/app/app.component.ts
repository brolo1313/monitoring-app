import { ChangeDetectorRef, Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SystemInfoService } from './services/system-info-service';
import { ElectronService } from './services/electron-service';
import { isElectronMode } from './helpers/helpers';
import { RoundMath } from './helpers/math-round.pipe';
import { LoaderComponent } from './components/loader/loader.component';
import { GbConvertPipe } from './helpers/gb-convert.pipe';
import { FooterComponent } from './components/footer/footer.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { SystemDataComponent } from './components/system-data/system-data.component';
import { ChatComponent } from './components/chat-bot/chat-bot.component';

declare global {
  interface Window {
    versions: any;
    electronAPI: any;
    electron: any;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RoundMath, LoaderComponent, GbConvertPipe, FooterComponent, TabsComponent, SystemDataComponent, ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  message: string = 'Status update...';

  systemInfoService = inject(SystemInfoService);
  electronService = inject(ElectronService);
  cdRef = inject(ChangeDetectorRef);

  public isElectronApp: boolean = false;
  public isLoading$ = this.systemInfoService.isLoading$;
  public collectedData$ = this.systemInfoService.collectedData$;

  public isDataReceived: boolean = false;

  @HostListener('window:beforeunload', ['$event'])
  onWindowBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isElectronApp) {
      (window as any).electron.ipcRenderer.send('clear-monitoring-interval');
    }
  }

  ngOnInit(): void {
    this.isElectronApp = isElectronMode();

    this.checkEnvRunning();

    this.systemInfoService.appUpdateMessage$.subscribe({
      next: (msg: string) => {
        this.message = msg;
        this.cdRef.detectChanges()
      }
    })
  }

  checkEnvRunning(): void {
    if (this.isElectronApp) {
      console.log('Run in Electron');
      this.systemInfoService.getDataFoBrowser();

      // this.systemInfoService.fetchDataFromElectron();
      // this.systemInfoService.checkUpdates();
    } else {
      console.log('Run in browser');
      this.systemInfoService.getDataFoBrowser();
    }
  }

  // await this.emitEventToMainProcess();
  async emitEventToMainProcess() {
    const response = await window.versions.ping()
    console.log('come from main process:', response) // prints out 'pong'
  }
}
