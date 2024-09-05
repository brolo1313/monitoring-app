import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, combineLatest, pairwise } from 'rxjs';
import { environment } from '../../environments/environment';
import { system_mocks } from '../mocks';

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
  private isLoading = new BehaviorSubject<any>(true);
  private collectedDataSubject = new BehaviorSubject<any>(null);

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
  isLoading$ = this.isLoading.asObservable();
  collectedData$ = this.collectedDataSubject.asObservable();


  public dataMocks = system_mocks;

  fetchDataFromElectron() {
    if (window['electron']) {
      window['electron'].ipcRenderer.on('system-monitoring-data', (data: any) => {

        this.combineSystemData();

        this.gpuDataSubject.next(data?.gpuData || null);
        this.currentLoad.next(data?.currentLoad || null);
        this.biosSubject.next(data?.bios || null);
        this.cpuSubject.next(data?.cpu || null);
        this.memSubject.next(data?.mem || null);
        this.systemSubject.next(data?.system || null);
        this.batterySubject.next(data?.battery || null);
        this.usersSubject.next(data?.users || null);
        this.osInfoSubject.next(data?.osInfo || null);
        this.wifiConnectionsSubject.next(data?.wifiConnections || null);

      });

      if (window.versions) {
        this.nodeVersionSubject.next(window.versions.node());
        this.chromeVersionSubject.next(window.versions.chrome());
        this.electronVersionSubject.next(window.versions.electron());
      }
    }
  }

  private combineSystemData() {
    combineLatest([
      this.gpuDataSubject,
      this.currentLoad.pipe(pairwise()),
      this.systemSubject,
      this.memSubject,
      this.cpuSubject,
      this.biosSubject,
      this.usersSubject,
      this.osInfoSubject,
      this.batterySubject,
      this.wifiConnectionsSubject,
      this.nodeVersionSubject,
      this.chromeVersionSubject,
      this.electronVersionSubject,
    ]).subscribe({
      next: ([gpuData, [prevCurrentLoad, currentLoad], system, mem, cpu, bios, users, osInfo, battery, wifiConnections, nodeVersion, chromeVersion, electronVersion]) => {


        if (!gpuData || !system || !cpu || !bios || !users || !mem || !osInfo || !battery || !wifiConnections) {
          console.log('Some data not been received');
          return;
        }

        if (true) {
          const collectedData = {
            systemInfo: { system, bios, users, osInfo },
            battery: battery,
            wifiConnections: wifiConnections,
            memory: mem,
            gpuData: gpuData,
            versions: {
              nodeVersion,
              chromeVersion,
              electronVersion,
            },
            cpuInfo: {
              coresLoading: {
                prevCurrentLoad: prevCurrentLoad,
                currentLoad: currentLoad
              },
              details: cpu,
            }
          };

          this.isLoading.next(false);
          this.collectedDataSubject.next(collectedData);
        }


      },
      error: (err) => {
        console.error('Error fetching system info:', err);
        this.isLoading.next(false);
      },
    });
  }
  checkUpdates() {
    window['electron'].ipcRenderer.on('updateMessage', (message: string) => {
      if (message) {
        this.appUpdateData.next(message);
      }
    });
  }

  getDataFoBrowser() {
    const { cpuInfo } = this.dataMocks;
    const result = {
      ...this.dataMocks,
      cpuInfo: cpuInfo,

    };
    this.collectedDataSubject.next(result);
    this.isLoading.next(false);
  }


  getLogFile(): Promise<string> {
    return (window as any).electron.ipcRenderer.invoke('download-log-file');
  }
}
