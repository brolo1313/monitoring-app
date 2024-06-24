// src/app/system-info.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {
  getSystemInfo(): Promise<any> {
    return (window as any).electronAPI.getSystemInfo();
  }
}
