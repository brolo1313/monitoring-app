export interface IOrganizedSystemData {
  battery: IBatteryInfo,
  cpuInfo?: {
    coresLoading?: ICoresLoading,
    details?: ICpuDetails
  },
  gpuData?: IGpuData,
  memory: IMemoryInfo,
  systemInfo: { system: ISystem; bios: IBios; users: IUser, osInfo: IOsInfo },
  wifiConnections: IWifiConnections
}

export enum TYPE_BENTO_ITEMS {
  wifiConnections = 'wifiConnections',
  systemInfo = 'systemInfo',
  battery = 'battery',
  memory = 'memory',
}

export interface IGpuController {
    vendor: string;
    model: string;
    bus: string;
    vram: number;
    vramDynamic: boolean;
    subDeviceId: string;
    driverVersion?: string;
    name?: string;
    pciBus?: string;
    memoryTotal?: number;
    memoryFree?: number;
    temperatureGpu?: number;
    powerDraw?: number;
    clockCore?: number;
    clockMemory?: number;
  }
  
  export interface IDisplay {
    vendor: string;
    model: string;
    deviceName: string;
    main: boolean;
    builtin: boolean;
    connection: string;
    resolutionX: number;
    resolutionY: number;
    sizeX: number;
    sizeY: number;
    pixelDepth: string;
    currentResX: number;
    currentResY: number;
    positionX: number;
    positionY: number;
    currentRefreshRate: number;
  }
  
  export interface IGpuData {
    controllers: IGpuController[];
    displays: IDisplay[];
  }
  
  export interface ICpuLoad {
    load: number;
    loadUser: number;
    loadSystem: number;
    loadNice: number;
    loadIdle: number;
    loadIrq: number;
    loadSteal: number;
    loadGuest: number;
    rawLoad: number;
    rawLoadUser: number;
    rawLoadSystem: number;
    rawLoadNice: number;
    rawLoadIdle: number;
    rawLoadIrq: number;
    rawLoadSteal: number;
    rawLoadGuest: number;
  }
  
  export interface ICoresLoading {
    avgLoad: number;
    currentLoad: number;
    currentLoadUser: number;
    currentLoadSystem: number;
    currentLoadNice: number;
    currentLoadIdle: number;
    currentLoadIrq: number;
    currentLoadSteal: number;
    currentLoadGuest: number;
    rawCurrentLoad: number;
    rawCurrentLoadUser: number;
    rawCurrentLoadSystem: number;
    rawCurrentLoadNice: number;
    rawCurrentLoadIdle: number;
    rawCurrentLoadIrq: number;
    rawCurrentLoadSteal: number;
    rawCurrentLoadGuest: number;
    cpus: ICpuLoad[];
  }
  
  export interface ICache {
    l1d: number;
    l1i: number;
    l2: number;
    l3: number;
  }
  
  export interface ICpuDetails {
    manufacturer: string;
    brand: string;
    vendor: string;
    family: string;
    model: string;
    stepping: string;
    revision: string;
    voltage: string;
    speed: number;
    speedMin: number;
    speedMax: number;
    governor: string;
    cores: number;
    physicalCores: number;
    performanceCores: number;
    efficiencyCores: number;
    processors: number;
    socket: string;
    flags: string;
    virtualization: boolean;
    cache: Cache;
  }
  
  export interface ICpuInfo {
    coresLoading: ICoresLoading;
    details: ICpuDetails;
  }
  
  export interface ISystem {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    uuid: string;
    sku: string;
    virtual: boolean;
  }
  
  export interface IBios {
    vendor: string;
    version: string;
    releaseDate: string;
    revision: string;
    serial: string;
  }
  
  export interface IUser {
    user: string;
    tty: string;
    date: string;
    time: string;
    ip: string;
    command: string;
  }
  
  export interface ISystemInfo {
    system: ISystem;
    bios: IBios;
    users: IUser[];
  }
  
  export interface SystemInfoResponse {
    gpuData: IGpuData;
    cpuInfo: ICpuInfo;
    systemInfo: ISystemInfo;
  }

  export interface IWifiConnections {
    id: string;
    iface: string;
    model: string;
    ssid: string;
    bssid: string;
    channel: number;
    frequency: number;
    type: string;
    security: string;
    signalLevel: number;
    quality: number;
    txRate: number;
}


export interface IBatteryInfo {
    hasBattery: boolean;
    cycleCount: number;
    isCharging: boolean;
    designedCapacity: number;
    maxCapacity: number;
    currentCapacity: number;
    voltage: number;
    capacityUnit: string;
    percent: number;
    timeRemaining: number | null;
    acConnected: boolean;
    type: string;
    model: string;
    manufacturer: string;
    serial: string;
}

export interface IMemoryInfo {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    buffers: number;
    cached: number;
    slab: number;
    buffcache: number;
    swaptotal: number;
    swapused: number;
    swapfree: number;
    writeback: number | null;
    dirty: number | null;
}


export interface IOsInfo {
    platform: string;
    distro: string;
    release: string;
    codename: string;
    kernel: string;
    arch: string;
    hostname: string;
    fqdn: string;
    codepage: string;
    logofile: string;
    serial: string;
    build: string;
    servicepack: string;
    uefi: boolean;
    hypervisor: boolean;
    remoteSession: boolean;
}
