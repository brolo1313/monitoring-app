import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SystemInfoService } from './services/system-info-service';
import { ElectronService } from './services/electron-service';
import { isElectronMode } from './helpers/helpers';
import { combineLatest } from 'rxjs';

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
    { content: 'variant-2.1', style: { '--columns': 'span 2' } },
    { content: 'variant-2.2', style: { '--columns': 'span 2' } },
    { content: 'variant-2.3', style: { '--rows': 'span 4', '--columns': '1 / -1' } },
    { content: 'variant-2.4', style: {} },
    { content: 'variant-2.5', style: { '--columns': 'span 2' } },
    { content: 'variant-2.6', style: {} },
  ];

  public isElectronApp: boolean = false;
  public isLoading: boolean = true;

  data: any;

  gpuData: any;
  cpuInfo: { temp: any; details: any } = { temp: null, details: null };
  systemInfo: { system: any; bios: any; users: any } = { system: null, bios: null, users: null };

  public gpuTemperature: number = 0;

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
    this.fetchSystemInfo();
    // await this.emitEventToMainProcess();
  }

  fetchSystemInfo() {
    this.isLoading = true;

    combineLatest([
      this.systemInfoService.gpuData$,
      this.systemInfoService.cpuTemp$,
      this.systemInfoService.system$,
      this.systemInfoService.mem$,
      this.systemInfoService.cpu$,
      this.systemInfoService.bios$,
      this.systemInfoService.users$
    ]).subscribe({
      next: ([gpuData, cpuTemp, system, mem, cpu, bios, users]) => {
        // Organize CPU-related data
        this.cpuInfo = {
          temp: cpuTemp,
          details: cpu
        };

        // Organize system-related data
        this.systemInfo = {
          system: system,
          bios: bios,
          users: users
        };

        // Handle GPU data
        if (gpuData) {
          this.gpuData = gpuData;
          this.gpuTemperature = gpuData?.controllers[0]?.temperatureGpu;
        }

        // Set isLoading to false only if all critical data is valid
        if (gpuData && cpuTemp && system && cpu && bios && users) {
          this.isLoading = false;
        } else {
          console.log('Incomplete data received:', {
            gpuData,
            cpuTemp,
            system,
            cpu,
            bios: users
          });
        }
      },
      error: (err) => {
        console.error('Error fetching system info:', err);
        this.isLoading = false;  // Ensure isLoading is false even on error
      }
    });
  }


  async emitEventToMainProcess() {
    const response = await window.versions.ping()
    console.log('come from main process:', response) // prints out 'pong'
  }

}
