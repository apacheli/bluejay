<svelte:head>
  <title>this is a title</title>
</svelte:head>

<script>
const link = "https://svelte.dev/";
</script>

<style>
  p {
    background-color: yellow;
  }
</style>

<p>Svelte is a UI framework that uses a compiler to let you write breathtakingly concise components that do minimal work in the browser, using languages you already know - HTML, CSS and JavaScript. <strong>It's a love letter to web development.</strong></p>

<p><a href={link}>Click here to learn more about Svelte.</a></p>

<h2><a href={Bun.env.BLUEJAY_PATH}>go back</a></h2>
