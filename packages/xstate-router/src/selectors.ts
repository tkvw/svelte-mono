import { ActorRefFrom, SnapshotFrom } from 'xstate';
import { createRouterMachineFactory } from './createRouterMachineFactory';

import { createSelector } from 'reselect';

type Snapshot = SnapshotFrom<
  ActorRefFrom<ReturnType<ReturnType<typeof createRouterMachineFactory>['createRouterMachine']>>
>;

export const selectContext = <TSnapshot extends Snapshot>(snapshot: TSnapshot) => {
  return snapshot.context;
};
export const selectBase = createSelector(selectContext, (x) => x.base);

export const selectUrl = createSelector(selectContext, (x) => x.url);
export const selectPathname = createSelector(selectUrl, (url) => url.pathname);
export const selectSearchParams = createSelector(selectUrl, (x) => x.searchParams);

export const selectRoute = (route: string | RegExp) => {
  if (typeof route === 'string' && route.indexOf('/:') >= 0) {
    route = namedPath(route);
  }

  return createSelector(
    selectBase,
    selectPathname,
    (base, pathname): { params?: Record<string, string>; match?: RegExpExecArray } | false => {
      if (base) {
        if (!pathname.startsWith(base)) {
          return false;
        }
        pathname = pathname.slice(base.length);
        if (!pathname.startsWith('/')) {
          pathname = '/' + pathname;
        }
      }
      if (typeof route === 'string') {
        return pathname === route ? {} : false;
      }

      const m = route.exec(pathname);
      if (m) {
        if (m.groups)
          return {
            params: m.groups,
            match: m
          };
        return {
          match: m
        };
      }
      return false;
    }
  );
};

const regExpEscape = (s: string) => s.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');

// compiles a named path such as /blog/:slug into a RegExp.
// Usually this will not be needed to be called directly since resolve()
// will detect named paths automatically and call this internally, but
// it's exported in case you want to use it.
// @param {string} route - a route to be compiled into regexp, ex: '/blog/:id'.
export function namedPath(route: string): RegExp {
  // checking for named component paths
  return RegExp(
    route
      .split('/')
      .map((x) =>
        x.startsWith(':')
          ? `(?<${regExpEscape(x.slice(1, x.length))}>[a-zA-Z0-9][a-zA-Z0-9\_\-]*)`
          : regExpEscape(x)
      )
      .join(`\\/`) + '$'
  );
}
