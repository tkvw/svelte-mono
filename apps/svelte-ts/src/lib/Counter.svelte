<script lang="ts">
  let count: number = 0;
  const increment = () => {
    count += 1;
  };
</script>

<button on:click={increment}>
  count is {count}
</button>

<style>
  button {
    font-size: 1em;
    padding: 0.5em 1em;
    margin: 1em;
  }
</style>
