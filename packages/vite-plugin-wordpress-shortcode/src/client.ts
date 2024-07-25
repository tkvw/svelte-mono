export interface DevelopmentArgs<TAttributes extends Record<string, any> = Record<string, any>> {
  attributes?: TAttributes;
  contents?: string;
}
export function startDevelopment<
  TAttributes extends Record<string, any> = Record<string, any>,
  TResult = any
>(
  shortcode: string,
  cb: (args: { attributes: TAttributes | undefined; contents: string | undefined }) => TResult
) {
  const jsonData = document.getElementById(`${shortcode}-attributes`)?.textContent;
  const contents = document.getElementById(`${shortcode}-content`)?.textContent;

  let attributes: TAttributes | undefined = undefined;
  if (jsonData) {
    try {
      attributes = JSON.parse(jsonData);
    } catch (e) {
      attributes = undefined;
    }
  }

  return cb({ attributes, contents: contents ?? undefined });
}

export interface ProductionArgs<TAttributes extends Record<string, any> = Record<string, any>>
  extends DevelopmentArgs<TAttributes> {
  target: HTMLElement;
  shortcode: string;
}

export function startProduction<
  TAttributes extends Record<string, any> = Record<string, any>,
  TResult = any
>(cb: (args: ProductionArgs<TAttributes>) => TResult) {
  return cb;
}
