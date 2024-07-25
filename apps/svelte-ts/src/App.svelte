<script lang="ts">
  import { createRouterMachine, selectRoute } from '@tkvw/xstate-router';
  import { useMachine, useSelector } from '@xstate/svelte';
  import svelteLogo from './assets/svelte.svg';
  import viteLogo from '/vite.svg';

  type TAttributes = $$Generic<Record<string, any>>;

  type $$Props = {
    attributes?: TAttributes;
    contents?: string;
    shortcode: string;
  };

  const { snapshot, send, actorRef } = useMachine(
    createRouterMachine({
      base: '/xxx'
    })
  );

  function useRoute(route: string) {
    return useSelector(actorRef, selectRoute(route));
  }

  const url = useSelector(actorRef, (snapshot) => {
    return snapshot.context.url;
  });

  $: console.log({ snapshot: $snapshot, url: $url });

  const homeRoute = useRoute('/');
  const blogRoute = useRoute('/blog/:post_id');

  $: console.log({
    homeRoute: $homeRoute,
    blogRoute: $blogRoute
  });
</script>

{#if $homeRoute}
  Home page
{:else if $blogRoute}
  Blog page
{:else}
  Not found
{/if}

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>
  <div>
    <a href="/">home</a>
    <a href="/somewhere/xxx">somewhere</a>
    <a href="/somewhere/xxx?x=1">somewhere 1</a>
    <a href="/blog/2354">Blog</a>
  </div>
  <div class="card">
    {#await import('./lib/Counter.svelte') then { default: CounterComponent }}
      <CounterComponent />
    {/await}
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer"
      >SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
