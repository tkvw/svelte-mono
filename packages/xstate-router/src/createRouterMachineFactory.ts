import { AnyEventObject, assertEvent, assign, fromCallback, setup } from 'xstate';
import { IRouterMachineContext, IRouterMachineFactoryOptions, IRouterMachineOptions } from './types';

export function createRouterMachineFactory<TData = any>(options: IRouterMachineFactoryOptions = {}) {
  const { actionPrefix = 'navigation' } = options;
  const isSsr = typeof window === 'undefined';

  const GOTO_TYPE = `${actionPrefix}.goto`;
  function goto(url: string | URL, data?: TData) {
    return {
      type: GOTO_TYPE,
      url,
      data
    };
  }

  type TEvents = ReturnType<typeof goto>;

  const machineFactory = setup({
    types: {
      context: {} as IRouterMachineContext,
      events: {} as TEvents
    },
    actions: {
      assignEvent: assign(({context,event}) => {
        const {url: baseUrl} = context;
        const {data,url} = event;

        const nextUrl = url instanceof URL? url: new URL(url,baseUrl);
        return {
          url: nextUrl,
          data: data
        };
      }),
      pushState: ({ context, event }) => {
        const {data,url} = context;
        
        if(window.location.href === url.href){
          return;
        }
        window.history.pushState(data ?? {}, '', url);
      }
    },
    actors: {
      router: fromCallback<TEvents,{base: string}>(({ input,sendBack }) => {
        const {base} = input;
        const start = () => {
          
          let lastKbdEv: KeyboardEvent | undefined;
          const events = {
            popstate: (event: PopStateEvent) => {
              event.preventDefault();
              sendBack(goto(window.location.href,history.state));
            },
            keydown: (event: KeyboardEvent) => {
              lastKbdEv = event;
            },
            keyup: () => (lastKbdEv = undefined),
            click: (event: MouseEvent) => {
              // Ctrl/Shift + clicks should open another tab/window
              let targetElement = event.target as HTMLElement;
              while (targetElement && targetElement !== document.body) {
                if (targetElement.tagName.toLowerCase() === 'a') {
                  if (lastKbdEv?.ctrlKey || lastKbdEv?.shiftKey) return;
                  // if (preventChange_ && preventChange_() === true) return event.preventDefault();
                  if (targetElement.hasAttribute('data-native-router')) return;
                  const href = targetElement.getAttribute('href') || '';

                  if(!href || base && !href.startsWith(base) || /^http?s\:\/\//.test(href)) return;
                  
                  sendBack(goto(href));
                  return event.preventDefault();
                }
                targetElement = targetElement.parentElement || document.body;
              }
            }
          };
          for (const [key, value] of Object.entries(events)) {
            window.addEventListener(key, value as EventListener);
          }
          return function cleanup() {
            for (const [key, value] of Object.entries(events)) {
              window.removeEventListener(key, value as EventListener);
            }
          };
        };

        let stop: undefined | (() => void) = undefined;
        function onWindowLoad() {
          stop = start();
        }
        window.addEventListener('load', onWindowLoad);
        if (window.document.readyState === 'complete') {
          onWindowLoad();
        }
        return function cleanup() {
          window.removeEventListener('load', onWindowLoad);
          if (stop) stop();
        };
      })
    }
  });

  function createRouterMachine({ base = '', data, url,strategy = 'url' }: IRouterMachineOptions = {}) {
    if (isSsr && !url) {
      throw new Error('URL must be provided in server-side environment');
    } else if (!isSsr) {
      if (!url) url = new URL(window.location.href);
      if (!data) data = history.state ?? {};
    }

    const machine = machineFactory.createMachine({
      context: {
        base,
        strategy,
        url: url!,
        data
      },
      initial: isSsr ? 'ssr' : 'browser',
      states: {
        browser: {
          invoke: {
            id: 'router',
            input: ({context}) => ({base: context.base}),
            src: 'router',
          },
          on: {
            [GOTO_TYPE]: [
              {
                actions: [
                  'assignEvent',
                  'pushState'
                ]
              }
            ]
          }
        },
        ssr: {
          on: {
            [GOTO_TYPE]: [
              {
                actions: [
                  'assignEvent'
                ]
              }
            ]
          }
        }
      }
    });
    return machine;
  }

  return {
    createRouterMachine,
    goto
  };
}
