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
  private socket!: WebSocket;
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
  

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.onopen = () => {
      console.log('Connected to WebSocket server');
      if (this.socket.readyState === WebSocket.OPEN) {
        this.intervalId = setInterval(() => {
          this.socket.send('get-system-info');
        }, 6000);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data: SystemData = JSON.parse(event.data);
        console.log('Message from server:', data);

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
      } catch (error) {
        console.log('Received non-JSON message:', event.data);
      }
    };

    this.socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    console.log('environment', environment);
  }


  getSystemInfo(): Promise<any> {
    if (!window.electronAPI) {
      return Promise.resolve(this.getUserMocks());
    } else {
      return (window as any).electronAPI.getSystemInfo();

    }
  }


  closeSocket(): void {
    this.clearSocketInterval();
    this.socket.close();
  }

  private clearSocketInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getUserMocks() {
    return {
      name: 'browser User',
    }
  }
}
