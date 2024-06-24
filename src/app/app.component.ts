import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SystemInfoService } from './services/system-info-service';
import { ElectronService } from './services/electron-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'electron-monitor-app';

  systemInfo: any;
  userInfo: any;

  constructor(private systemInfoService: SystemInfoService,
    private electronService: ElectronService,
  ) {
    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

 async ngOnInit() {
    this.systemInfo = await this.systemInfoService.getSystemInfo();

    // this.userInfo =  this.systemInfoService.getUserMocks();
    // this.systemInfo =  this.systemInfoService.getSystemInfo1();

    console.log(' this.systemInfo', this.systemInfo);

  }
}
