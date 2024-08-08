export type TRouterStrategy = "hash" | "url";

export interface IRouterMachineOptions<TData = any> {
  base?: string;
  strategy?: TRouterStrategy,
  url?: URL;
  data?: TData;
}
export interface IRouterMachineContext<TData = any> {
  base: string;
  strategy: TRouterStrategy,
  url: URL;
  data?: TData;
}

export interface IRouterMachineFactoryOptions {
  actionPrefix?: string;
}
