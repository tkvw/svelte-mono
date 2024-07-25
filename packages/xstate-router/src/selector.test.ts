import { describe, expect, it } from 'vitest';
import { getInitialSnapshot, getNextSnapshot } from 'xstate';
import { createRouterMachine, goto } from './createRouterMachine';

import { selectRoute } from './selectors';

describe('Router selector tests', () => {
  describe('with empty base', () => {
    const routerMachine = createRouterMachine({
      base: '',
      url: new URL('http://localhost:3000')
    });
    const homeRoute = selectRoute('/');
    const blogRoute = selectRoute('/blog/:id');

    it('should match home', () => {
      const currentState = getInitialSnapshot(routerMachine);
      expect(currentState.value).toBe('ssr');
      expect(homeRoute(currentState)).toBeTruthy();
      expect(homeRoute(currentState)).toMatchObject({});

      const nextState = getNextSnapshot(
        routerMachine,
        currentState,
        goto('http://localhost:3000/')
      );
      expect(homeRoute(nextState)).toMatchObject({});
      expect(blogRoute(nextState)).toBe(false);
    });

    it("should match blog with id '123'", () => {
      const currentState = getInitialSnapshot(routerMachine);
      const nextState = getNextSnapshot(
        routerMachine,
        currentState,
        goto('http://localhost:3000/blog/123')
      );
      expect(homeRoute(nextState)).toBe(false);
      expect(blogRoute(nextState)).containSubset({ params: { id: '123' } });
    });
  });
  describe('with base route set', () => {
    const routerMachine = createRouterMachine({
      base: '/nl',
      url: new URL('http://localhost:3000')
    });
    const homeRoute = selectRoute('/');
    const blogRoute = selectRoute('/blog/:id');

    it('should not match home', () => {
      const currentState = getInitialSnapshot(routerMachine);
      expect(currentState.value).toBe('ssr');
      expect(homeRoute(currentState)).toBe(false);

      const nextState = getNextSnapshot(
        routerMachine,
        currentState,
        goto('http://localhost:3000/nl')
      );
      expect(homeRoute(nextState)).toBeTruthy();
    });

    it("should match blog with id '123'", () => {
      const currentState = getInitialSnapshot(routerMachine);
      const nextState = getNextSnapshot(
        routerMachine,
        currentState,
        goto('http://localhost:3000/nl/blog/123')
      );
      expect(homeRoute(nextState)).toBe(false);
      expect(blogRoute(nextState)).containSubset({ params: { id: '123' } });
    });
  });

  // const routerMachine = createRouterMachine({
  //   base: '',
  //   url: new URL('http://localhost:3000')
  // });

  //

  // const router = createActor(routerMachine);

  // it('should not match home', () => {
  //   expect(homeRoute(router.getSnapshot())).toBe(false);
  // });
});
