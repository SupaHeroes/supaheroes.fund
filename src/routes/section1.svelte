<script>
import { goto } from "$app/navigation";

  import Sbutton from "@comp/sbutton.svelte";
</script>
<section class="section min-h-screen flex">
  <div class="w-1/2 mx-auto my-auto">
    
      <img
      data-aos="fade-up"
        class="mt-10 mx-auto"
        width="800"
        height="800"
        src="https://ik.imagekit.io/1irdz9lsyrw/greek_P8indg2J_Jz.png?updatedAt=1638371193515"
        alt=""
      />
    
  </div>
  <div class="h-screen w-1 bg-supagreen-dark"></div>
  <div class="w-1/2 mx-auto my-auto">
    <div class=" text-gray-300">
      <p data-aos="fade-up" class=" my-3 text-left font-inter max-w-lg mx-auto">
        We love economic theories 💖
      </p>

      <p data-aos="fade-up" class="text-gray-50 max-w-lg mx-auto font-bold font-commorant text-4xl">
        Building on What Works
      </p>
      <p data-aos="fade-up" class=" my-8 text-left font-inter max-w-lg mx-auto">
        Our mechanics are built on top of the foundational economics knowledge of the past for projects of today. Connecting the latest DeFi innovations for crowdfunding mechanisms that are understood and loved by many.
      </p>
    </div>
    <div data-aos="fade-up" class="max-w-lg mx-auto mt-6">
      <Sbutton on:click={async () => await goto("https://docs-supaheroes.netlify.app/")}><p class="text-white">Learn How it Works</p></Sbutton>
    </div>
  </div>
</section>
