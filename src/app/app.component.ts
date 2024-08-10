import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SystemInfoService } from './services/system-info-service';
import { ElectronService } from './services/electron-service';
import { isElectronMode } from './helpers/helpers';

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

  public isElectronApp: boolean = false;
  public isLoading: Boolean = false;

  data: any;

  gpuData: any;
  cpuTemp: any;

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

  async ngOnInit() {
    this.systemInfoService.gpuData$.subscribe(data => {
      this.gpuData = data;
      this.gpuTemperature = data?.controllers[0]?.temperatureGpu;
    });

    this.systemInfoService.cpuTemp$.subscribe(temp => {
      this.cpuTemp = temp;
    });
    // await this.fetchSystemInfo();
    // await this.emitEventToMainProcess();
  }

  async fetchSystemInfo() {
    // this.isLoading = true;
    // try {
    //   this.data = await this.systemInfoService.getSystemInfo();
    //   if (this.data) {
    //     this.isLoading = false;
    //   }
    // } catch (error) {
    //   this.isLoading = false;
    //   console.error('Error fetching system info', error);
    // }
  }

  async emitEventToMainProcess() {
    const response = await window.versions.ping()
    console.log('come from main process:', response) // prints out 'pong'
  }

}
