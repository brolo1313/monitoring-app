import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {
  private socket: WebSocket;
  private gpuDataSubject = new BehaviorSubject<any>(null);
  private cpuTempSubject = new BehaviorSubject<any>(null);

  gpuData$ = this.gpuDataSubject.asObservable();
  cpuTemp$ = this.cpuTempSubject.asObservable();

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.onopen = () => {
      console.log('Connected to WebSocket server');
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send('get-system-info');
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Message from server:', data);

        if (data.gpuData) {
          this.gpuDataSubject.next(data.gpuData);
        }

        if (data.cpuTemp) {
          this.cpuTempSubject.next(data.cpuTemp);
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
  }


  // getSystemInfo(): Promise<any> {
  //   return (window as any).electronAPI.getSystemInfo();
  // }

  // getSystemInfo1() {
  //   return window;
  // }

  // getUserMocks() {
  //   return {
  //     name: 'user',
  //     age: '13'
  //   }
  // }
}
