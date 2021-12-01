<script>
    export let max;
    export let value;
</script>

<div class=" bg-gray-600 rounded-full mb-2">
    <div
      class="bg-supagreen transition duration-500 ease-in-out transform bg-gradient-to-r from-supagreen-dark to-supagreen py-1 rounded-full"
      style="width: {((value / max) * 100).toFixed(
        2
      ) + '%'};"
    />
  </div>