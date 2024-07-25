import { assign, fromCallback, setup } from 'xstate';
import { IContext, RouterMachineFactoryOptions, RouterMachineOptions } from './types';

export function createRouterMachineFactory(options: RouterMachineFactoryOptions = {}) {
  const { actionPrefix = 'navigation' } = options;
  const isSsr = typeof window === 'undefined';

  const GOTO_TYPE = `${actionPrefix}.goto`;
  function goto(url: URL | string, data?: any, options: { replace?: boolean } = {}) {
    const href = url instanceof URL ? url.toString() : url;
    const finalUrl = new URL(href, isSsr ? undefined : window.location.href);
    return {
      type: GOTO_TYPE,
      url: finalUrl,
      data,
      options
    };
  }

  type TEvents = ReturnType<typeof goto>;

  const machineFactory = setup({
    types: {
      context: {} as IContext,
      events: {} as TEvents
    },
    guards: {
      url_changed: ({ context, event }) => {
        return context.url.toString() !== event.url.toString();
      }
    },
    actions: {
      push_state: ({ context, event }) => {
        if (event.type !== GOTO_TYPE) return;

        const { data, url, options } = event;
        if (!options?.replace) return;
        window.history.pushState(data ?? {}, '', url.href);
      }
    },
    actors: {
      router: fromCallback(({ sendBack }) => {
        const start = () => {
          function updateUrl(url = window.location.href, replace = false) {
            sendBack(goto(new URL(url, window.location.href), history.state, { replace }));
          }

          let lastKbdEv: KeyboardEvent | undefined;
          const events = {
            hashchange: updateUrl,
            popstate: (event: PopStateEvent) => {
              event.preventDefault();
              updateUrl();
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
                  // do not handle external links
                  if (!/^http?s\:\/\//.test(href)) {
                    if (href) updateUrl(href, true);
                    return event.preventDefault();
                  }
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

  function createRouterMachine({ base = '', data, url }: RouterMachineOptions = {}) {
    if (isSsr && !url) {
      throw new Error('URL must be provided in server-side environment');
    } else if (!isSsr) {
      if (!url) url = new URL(window.location.href);
      if (!data) data = history.state ?? {};
    }

    const machine = machineFactory.createMachine({
      context: {
        base,
        url: url!,
        data
      },
      initial: isSsr ? 'ssr' : 'browser',
      states: {
        browser: {
          invoke: {
            src: 'router',
            id: 'router'
          },
          on: {
            [GOTO_TYPE]: [
              {
                guard: 'url_changed',
                actions: [
                  assign({
                    data: ({ event }) => event.data,
                    url: ({ event }) => event.url
                  }),
                  'push_state'
                ]
              }
            ]
          }
        },
        ssr: {
          on: {
            [GOTO_TYPE]: [
              {
                guard: 'url_changed',
                actions: [
                  assign({
                    data: ({ event }) => event.data,
                    url: ({ event }) => event.url
                  })
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
