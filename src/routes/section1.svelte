<script>
  import { goto } from "$app/navigation";

  import Sbutton from "@comp/sbutton.svelte";
</script>

<section class="section bg-green-900">
  <div
    
    class="min-h-screen flex flex-col items-center justify-center"
  >
  <div class="w-1/2 mx-auto">
    <p
      class="text-gray-50 w-full mx-auto font-bold text-center font-commorant uppercase border-b pb-4 text-4xl border-supagreen-dark"
    >
      Success Helps Others
    </p>
    <p
      class="text-gray-300 w-full mx-auto text-center font-inter uppercase text-lg pt-4"
    >
      Your Success directly contributes to Public Goods fund 💖
    </p>
  </div>

  <div class="w-full mx-auto">
    <img class="mx-auto" width="80%" height="50%" src="economy.png" alt="" />
  </div>
  </div>
</section>
