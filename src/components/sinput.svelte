<script>
    export let placeholder;
    export let value
</script>
<input
bind:value={value}
      placeholder={placeholder}
      class="h-10 pl-3 pr-2 border border-gray-700 rounded-md appearance-none text-white px-3 bg-supadark-dark w-full outline-none focus:outline-none active:outline-none"
    />