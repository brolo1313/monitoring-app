import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, SimpleChanges, VERSION } from '@angular/core';
import { combineLatest, pairwise } from 'rxjs';
import { IBatteryInfo, IBios, ICpuInfo, IGpuData, IMemoryInfo, IOrganizedSystemData, IOsInfo, ISystem, IUser, IWifiConnections, TYPE_BENTO_ITEMS } from '../../models/system-data.models';
import { isElectronMode } from '../../helpers/helpers';
import { ElectronService } from '../../services/electron-service';
import { SystemInfoService } from '../../services/system-info-service';
import { system_mocks } from '../../mocks';
import { RoundMath } from '../../helpers/math-round.pipe';
import { GbConvertPipe } from '../../helpers/gb-convert.pipe';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';


interface BENTO_ITEMS {
  type: string;
  class: string;
  wifiConnections?: IWifiConnections | any;
  systemInfo?: { system: ISystem; bios: IBios; users: IUser, osInfo: IOsInfo } | any;
  battery?: IBatteryInfo | any;
  memory?: IMemoryInfo | any;
  versions?: any;
  gpu?: IGpuData | any;
}

@Component({
  selector: 'app-system-data',
  standalone: true,
  imports: [
    CommonModule,
    RoundMath,
    GbConvertPipe
  ],
  templateUrl: './system-data.component.html',
  styleUrl: './system-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('bentoAnimation', [
      transition(':enter', [
        query('.bento__item, .footer', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ]),

  ]
})
export class SystemDataComponent {

  electronService = inject(ElectronService);
  cdRef = inject(ChangeDetectorRef);

  @Input() collectedData: any;

  @Output() onCollectedData = new EventEmitter();
  @Output() onLoading = new EventEmitter();
  @Output() onDataReceived = new EventEmitter();

  angularVersion = VERSION.full;

  items: BENTO_ITEMS[] = [
    { type: 'gpu', class: 'bento__item-2', gpu: {} },
    { type: 'battery', class: 'bento__item-3', wifiConnections: {} },
    { type: 'systemInfo', class: 'bento__item-4', systemInfo: {} },
    { type: 'wifiConnections', class: 'bento__item-5', battery: {} },
    { type: 'memory', class: 'bento__item-6', memory: {} },
    { type: 'versions', class: 'bento__item-7', versions: {} },

  ];

  public type = TYPE_BENTO_ITEMS;

  cpuInfo!: ICpuInfo | any;
  versions!: any;

  ngOnChanges({ collectedData }: SimpleChanges) {
    const { cpuInfo } = collectedData.currentValue;
    this.fillArray(this.items, collectedData.currentValue);
    this.cpuInfo = cpuInfo
  }

  private fillArray(array: any[], data: IOrganizedSystemData | any) {
    const { systemInfo, battery, memory, wifiConnections, versions, gpuData } = data;

    array.forEach((item: any) => {
      if (item.type === this.type.battery) {
        item.battery = battery;
      }
      if (item.type === this.type.memory) {
        item.memory = memory;
      }
      if (item.type === this.type.systemInfo) {
        item.systemInfo = systemInfo;
      }
      if (item.type === this.type.wifiConnections) {
        item.wifiConnections = wifiConnections;
      }

      if (item.type === this.type.versions) {
        item.versions = versions;
      }

      if (item.type === this.type.gpu) {
        item.gpu = gpuData;
      }
    })
  }

  isRed(data: any, state: any): boolean {
    return state === 'cpu' ? (data?.loadSystem ?? 0) > 50 : (data?.temperatureGpu ?? 0) > 50;
  }

  isGreen(data: any, state: any): boolean {
    return state === 'cpu' ? (data?.loadSystem ?? 0) < 50 : (data?.temperatureGpu ?? 0) < 50;
  }

}
