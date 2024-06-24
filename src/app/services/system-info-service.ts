// src/app/system-info.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {
  getSystemInfo(): Promise<any> {
    return (window as any).electronAPI.getSystemInfo();
  }
  
  getSystemInfo1(){
    return window;
  }

  getUserMocks() {
    return  {
      name: 'user',
      age: '13'
    }
  }
}
