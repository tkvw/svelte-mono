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
>(startApp: (args: ProductionArgs<TAttributes>) => TResult) {

  return (shortcode: string, shadowDom: boolean) => {
    const targets = shadowDom ? getTargetsFromShadowDom(shortcode) :
      getTargetsFromDom(shortcode);

    for (const { targetElement, attributesElement, contentsElement } of targets) {
      let attributes: TAttributes;
      try {
        attributes = JSON.parse(attributesElement.textContent!);
      }
      catch (e) {
        attributes = {} as TAttributes;
      }
      startApp({
        attributes,
        contents: contentsElement?.textContent ?? undefined,
        target: targetElement,
        shortcode
      });

    }
  };
}




interface ShortCodeTarget {
  targetElement: HTMLElement;
  attributesElement: HTMLElement;
  contentsElement: HTMLElement;
}

function getTargetsFromDom(shortcode: string): ShortCodeTarget[] {
  const elements = document.querySelectorAll(`div[data-wps="${shortcode}"]`);
  const result = [] as ShortCodeTarget[];
  elements.forEach(target => {
    const targetElement = target as HTMLElement;

    const id = targetElement.dataset['wpsId'];
    const attributesElement = document.getElementById(`${shortcode}-attributes-${id}`) as HTMLElement;
    const contentsElement = document.getElementById(`${shortcode}-content-${id}`) as HTMLElement;

    result.push({
      attributesElement,
      contentsElement,
      targetElement
    })
  });

  return result;
}

function getTargetsFromShadowDom(shortcode: string) {
  const elements = document.querySelectorAll(`div[data-wps-container="${shortcode}"]`);
  const result = [] as ShortCodeTarget[];
  elements.forEach(element => {
    const sr = element.shadowRoot;
    if (!sr) return;
    const targetElement = sr.querySelector(`div[data-wps="${shortcode}"]`) as HTMLElement;
    if (!targetElement) return;

    const id = (targetElement as HTMLElement).dataset['wpsId'];
    const attributesElement = sr.getElementById(`${shortcode}-attributes-${id}`) as HTMLElement;
    const contentsElement = sr.getElementById(`${shortcode}-content-${id}`) as HTMLElement;

    result.push({
      attributesElement,
      contentsElement,
      targetElement
    })
  });

  return result;
}
