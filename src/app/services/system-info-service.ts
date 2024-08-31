import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

interface SystemData {
  bios: {},
  gpuData: {},
  mem: {},
  system: {},
  currentLoad: {},
  users: [],
  cpu: {},
  battery: {},
  osInfo: {},
  wifiConnections: [],
}

@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {
  private gpuDataSubject = new BehaviorSubject<any>(null);
  private currentLoad = new BehaviorSubject<any>(null);
  private biosSubject = new BehaviorSubject<any>(null);
  private cpuSubject = new BehaviorSubject<any>(null);
  private memSubject = new BehaviorSubject<any>(null);
  private systemSubject = new BehaviorSubject<any>(null);
  private batterySubject = new BehaviorSubject<any>(null);
  private usersSubject = new BehaviorSubject<any>(null);
  private osInfoSubject = new BehaviorSubject<any>(null);
  private wifiConnectionsSubject = new BehaviorSubject<any>(null);

  private nodeVersionSubject = new BehaviorSubject<any>(null);
  private chromeVersionSubject = new BehaviorSubject<any>(null);
  private electronVersionSubject = new BehaviorSubject<any>(null);

  private appUpdateData = new BehaviorSubject<any>('Status update...');

  private intervalId: any;

  gpuData$ = this.gpuDataSubject.asObservable();
  currentLoad$ = this.currentLoad.asObservable();
  bios$ = this.biosSubject.asObservable();
  cpu$ = this.cpuSubject.asObservable();
  mem$ = this.memSubject.asObservable();
  system$ = this.systemSubject.asObservable();
  battery$ = this.batterySubject.asObservable();
  users$ = this.usersSubject.asObservable();
  osInfo$ = this.osInfoSubject.asObservable();
  wifiConnections$ = this.wifiConnectionsSubject.asObservable();

  nodeVersion$ = this.nodeVersionSubject.asObservable();
  chromeVersion$ = this.chromeVersionSubject.asObservable();
  electronVersion$ = this.electronVersionSubject.asObservable();

  appUpdateMessage$ = this.appUpdateData.asObservable();


  fetchDataFromELectron() {
    if (window['electron']) {
      window['electron'].ipcRenderer.on('system-monitoring-data', (data: any) => {
        if (data?.gpuData) {
          this.gpuDataSubject.next(data.gpuData);
        }

        if (data?.currentLoad) {
          this.currentLoad.next(data.currentLoad);
        }

        if (data?.bios) {
          this.biosSubject.next(data.bios);
        }

        if (data?.mem) {
          this.memSubject.next(data.mem);
        }

        if (data?.system) {
          this.systemSubject.next(data.system);
        }

        if (data?.osInfo) {
          this.osInfoSubject.next(data.osInfo);
        }

        if (data?.battery) {
          this.batterySubject.next(data.battery);
        }

        if (data?.wifiConnections) {
          this.wifiConnectionsSubject.next(data.wifiConnections);
        }

        if (data?.users) {
          this.usersSubject.next(data.users);
        }

        if (data?.cpu) {
          this.cpuSubject.next(data.cpu);
        }
      });
    }

    if (window.versions) {
      this.nodeVersionSubject.next(window.versions.node());
      this.chromeVersionSubject.next(window.versions.chrome());
      this.electronVersionSubject.next(window.versions.electron());
    }
  }

  checkUpdates() {
    window['electron'].ipcRenderer.on('updateMessage', (message: string) => {
      if (message) {
        this.appUpdateData.next(message);
      }
    });
  }

  getLogFile(): Promise<string> {
    return (window as any).electron.ipcRenderer.invoke('download-log-file');
  }


  getSystemInfo(): Promise<any> {
    if (!window.electronAPI) {
      return Promise.resolve(this.getUserMocks());
    } else {
      return (window as any).electronAPI.getSystemInfo();
    }
  }

  getUserMocks() {
    return {
      name: 'browser User',
    }
  }
}
