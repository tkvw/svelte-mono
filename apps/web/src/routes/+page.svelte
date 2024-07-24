<script lang="ts">
	import { MyCounterButton } from '@repo/ui';
	import { add } from '@tkvw/math';
</script>

<h1>Web</h1>
<MyCounterButton />
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div>{add(1, 2)}</div>
