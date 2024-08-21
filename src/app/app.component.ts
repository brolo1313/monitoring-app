import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SystemInfoService } from './services/system-info-service';
import { ElectronService } from './services/electron-service';
import { isElectronMode } from './helpers/helpers';
import { combineLatest, pairwise } from 'rxjs';
import { IBatteryInfo, IBios, ICoresLoading, ICpuDetails, IGpuData, IMemoryInfo, IOrganizedSystemData, IOsInfo, ISystem, IUser, IWifiConnections, TYPE_BENTO_ITEMS } from './models/system-data.models';
import { system_mocks } from './mocks';
import { RoundMath } from './helpers/math-round.pipe';
import { LoaderComponent } from './components/loader/loader.component';

declare global {
  interface Window {
    versions: any;
    electronAPI: any;
    electron: any;
  }
}

interface BENTO_ITEMS {
  type: string;
  class: string;
  wifiConnections?: IWifiConnections | any;
  systemInfo?: { system: ISystem; bios: IBios; users: IUser, osInfo: IOsInfo } | any;
  battery?: IBatteryInfo | any;
  memory?: IMemoryInfo | any;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RoundMath, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'electron-monitor-app';

  items: BENTO_ITEMS[] = [
    { type: 'battery', class: 'bento__item-3', wifiConnections: {} },
    { type: 'systemInfo', class: 'bento__item-4', systemInfo: {} },
    { type: 'wifiConnections', class: 'bento__item-5', battery: {} },
    { type: 'memory', class: 'bento__item-6', memory: {} },
  ];

  private dataMocks = system_mocks;

  public type = TYPE_BENTO_ITEMS;
  public isElectronApp: boolean = false;
  public isLoading: boolean = true;
  public isDataReceived: boolean = false;

  gpuData!: IGpuData;
  cpuInfo!: { details: ICpuDetails, coresLoading: ICoresLoading };

  constructor(private systemInfoService: SystemInfoService,
    private electronService: ElectronService,
    private cdRef: ChangeDetectorRef
  ) {
    this.isElectronApp = isElectronMode();
    if (this.isElectronApp) {
      console.log('Run in electron');
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit() {
    console.log('ngOnInit', this.dataMocks);
    const { gpuData, cpuInfo, systemInfo, battery, memory, wifiConnections } = this.dataMocks;
    this.gpuData = gpuData;
    this.cpuInfo = cpuInfo as any;
    this.fillArray(this.items, this.dataMocks)
    // this.fetchSystemInfo();
    // await this.emitEventToMainProcess();
  }

  private fillArray(array: any[], data: IOrganizedSystemData | any) {
    const { systemInfo, battery, memory, wifiConnections } = data;

    array.forEach((item: any) => {
      if (item.type === this.type.battery) {
        item.battery = battery;
      }
      if (item.type === this.type.memory) {
        item.memory = memory;
      }
      if (item.type === this.type.systemInfo) {
        item.systemInfo = systemInfo;
      }
      if (item.type === this.type.wifiConnections) {
        item.wifiConnections = wifiConnections;
      }
    })


    console.log('items after filledArray', this.items);
  }

  fetchSystemInfo() {
    this.systemInfoService.fetchDataFromELectron();
    this.isLoading = true;

    combineLatest([
      this.systemInfoService.gpuData$,
      this.systemInfoService.currentLoad$.pipe(pairwise()),
      this.systemInfoService.system$,
      this.systemInfoService.mem$,
      this.systemInfoService.cpu$,
      this.systemInfoService.bios$,
      this.systemInfoService.users$,
      this.systemInfoService.osInfo$,
      this.systemInfoService.battery$,
      this.systemInfoService.wifiConnections$,
    ]).subscribe({
      next: ([gpuData, [prevCurrentLoad, currentLoad], system, mem, cpu, bios, users, osInfo, battery, wifiConnections]) => {
        this.cpuInfo = {
          coresLoading: currentLoad,
          details: cpu,
        };

        this.gpuData = gpuData;

        if (system && bios && users && mem && osInfo && battery && wifiConnections) {
          const arrayForFill =
          {
            systemInfo: { system, bios, users, osInfo },
            battery: battery,
            wifiConnections: wifiConnections,
            memory: mem
          }
            ;

          this.fillArray(this.items, arrayForFill);
        }


        // Check if all data has been received
        if (gpuData && system && cpu && bios && users && mem && osInfo && battery && wifiConnections) {
          this.isLoading = false;
          this.isDataReceived = true;
          this.cdRef.detectChanges();
        }


        if (!gpuData || !system || !cpu || !bios || !users || !mem || !osInfo || !battery || !wifiConnections) {
          console.log('some data not been received');
        }

        // console.log('prevCurrentLoad', prevCurrentLoad);
        // console.log('currentLoad', currentLoad);

      },
      error: (err) => {
        console.error('Error fetching system info:', err);
        this.isLoading = false; // Ensure isLoading is false even on error
      },
    });
  }



  async emitEventToMainProcess() {
    const response = await window.versions.ping()
    console.log('come from main process:', response) // prints out 'pong'
  }

}
