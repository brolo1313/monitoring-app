import { ChangeDetectorRef, Component, HostListener, OnDestroy, VERSION } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SystemInfoService } from './services/system-info-service';
import { ElectronService } from './services/electron-service';
import { isElectronMode } from './helpers/helpers';
import { combineLatest, pairwise } from 'rxjs';
import { IBatteryInfo, IBios, ICoresLoading, ICpuDetails, ICpuInfo, IGpuData, IMemoryInfo, IOrganizedSystemData, IOsInfo, ISystem, IUser, IWifiConnections, TYPE_BENTO_ITEMS } from './models/system-data.models';
import { system_mocks } from './mocks';
import { RoundMath } from './helpers/math-round.pipe';
import { LoaderComponent } from './components/loader/loader.component';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { GbConvertPipe } from './helpers/gb-convert.pipe';
import { FooterComponent } from './components/footer/footer.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { SystemDataComponent } from './components/system-data/system-data.component';

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
  imports: [CommonModule, RouterOutlet, RoundMath, LoaderComponent, GbConvertPipe, FooterComponent, TabsComponent, SystemDataComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  message: string = 'Status update...';

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

  constructor(private systemInfoService: SystemInfoService,
    private electronService: ElectronService,
    private cdRef: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.isElectronApp = isElectronMode();

    if (this.isElectronApp) {
      console.log('Run in Electron');
      this.systemInfoService.getDataFoBrowser();

      // this.systemInfoService.fetchDataFromElectron();
      // this.systemInfoService.checkUpdates();
    } else {
      console.log('Run in browser');
      this.systemInfoService.getDataFoBrowser();
    }


    this.systemInfoService.appUpdateMessage$.subscribe({
      next: (msg: string) => {
        this.message = msg;
        this.cdRef.detectChanges()
      }
    })

  }

  // await this.emitEventToMainProcess();
  async emitEventToMainProcess() {
    const response = await window.versions.ping()
    console.log('come from main process:', response) // prints out 'pong'
  }
}
