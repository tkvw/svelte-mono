export interface RouterMachineOptions {
  base?: string;
  url?: URL;
  data?: any;
}
export interface IContext {
  base: string;
  url: URL;
  data?: any;
}

export interface RouterMachineFactoryOptions {
  actionPrefix?: string;
}
