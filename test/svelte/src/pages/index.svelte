<svelte:head>
  <title>Hello</title>
  <link rel="icon" href={`${Bun.env.BLUEJAY_PATH}/icon.png`} />
</svelte:head>

<script lang="ts">
const name: string = "World";
</script>

<style>
  h1 {
    background-color: green;
  }
</style>

<h1>Hello, {name}!</h1>

<p>The date is <strong>{new Date().toDateString()}</strong></p>

<a href={`${Bun.env.BLUEJAY_PATH}/hello`}>hello</a>
