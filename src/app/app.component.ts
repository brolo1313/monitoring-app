import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SystemInfoService } from './services/system-info-service';
import { ElectronService } from './services/electron-service';
import { isElectronMode } from './helpers/helpers';
import { combineLatest } from 'rxjs';
import { IBatteryInfo, IBios, ICoresLoading, ICpuDetails, IGpuData, IMemoryInfo, IOsInfo, ISystem, IUser, IWifiConnections } from './models/system-data.models';
import { system_mocks } from './mocks';

declare global {
  interface Window {
    versions: any;
    electronAPI: any;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'electron-monitor-app';

  items = [
    { class: 'bento__item-2', content: 'variant-2.1' },
    { class: 'bento__item-3', content: 'variant-2.2' },
    { class: 'bento__item-4', content: 'variant-2.3' },
    { class: 'bento__item-5', content: 'variant-2.4' },
    { class: 'bento__item-6', content: 'variant-2.5' },
    { class: 'bento__item-7', content: 'variant-2.6' },
  ];

  private data = system_mocks;

  public isElectronApp: boolean = false;
  public isLoading: boolean = true;
  public isDataReceived: boolean = false;

  gpuData!: IGpuData;
  memory!: IMemoryInfo;
  osInfo!: IOsInfo;
  battery!: IBatteryInfo;
  wifiConnections!: IWifiConnections;
  cpuInfo!: { details: ICpuDetails, coresLoading: ICoresLoading };
  systemInfo!: { system: ISystem; bios: IBios; users: IUser };

  constructor(private systemInfoService: SystemInfoService,
    private electronService: ElectronService,
  ) {
    this.isElectronApp = isElectronMode();
    if (this.isElectronApp) {
      console.log('Run in electron');
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit() {
    console.log('ngOnInit',this.data);
    const {gpuData, cpuInfo, systemInfo } = this.data;
    this.gpuData = gpuData;
    this.cpuInfo = cpuInfo as any;
    this.systemInfo = systemInfo as any;

    // this.fetchSystemInfo();
    // await this.emitEventToMainProcess();
  }

  fetchSystemInfo() {
    this.isLoading = true;
  
    combineLatest([
      this.systemInfoService.gpuData$,
      this.systemInfoService.currentLoad$,
      this.systemInfoService.system$,
      this.systemInfoService.mem$,
      this.systemInfoService.cpu$,
      this.systemInfoService.bios$,
      this.systemInfoService.users$,
      this.systemInfoService.osInfo$,
      this.systemInfoService.battery$,
      this.systemInfoService.wifiConnections$,
    ]).subscribe({
      next: ([gpuData, currentLoad, system, mem, cpu, bios, users, osInfo, battery, wifiConnections]) => {
        this.cpuInfo = {
          coresLoading: currentLoad,
          details: cpu,
        };
  
        this.memory = mem;
  
        this.systemInfo = {
          system: system,
          bios: bios,
          users: users,
        };
  
        this.osInfo = osInfo;
        this.battery = battery;
        this.gpuData = gpuData;
        this.wifiConnections = wifiConnections;
  
        // Check if all data has been received
        if (gpuData && system && cpu && bios && users && mem && osInfo && battery && wifiConnections) {
          this.isLoading = false;
          this.isDataReceived = true;
          console.log('data received:', {
            gpuData: this.gpuData,
            cpuInfo: this.cpuInfo,
            systemInfo: this.systemInfo,
          });
        }


        if(!gpuData || !system || !cpu || !bios || !users || !mem || !osInfo || !battery || !wifiConnections){
          console.log('some data not been received');
        }
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

  closeSocket(): void {
    this.systemInfoService.closeSocket();
  }

}
