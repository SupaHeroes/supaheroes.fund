<script>
  import { goto } from "$app/navigation";

  import Sbutton from "@comp/sbutton.svelte";
  import Section1 from "./section1.svelte";
  import Section2 from "./section2.svelte";
import Section3 from "./section3.svelte";
import Section4 from "./section4.svelte";
  import Subsection from "./subsection.svelte";
</script>

<!-- Hero Section -->
<div>
  <section
    style="background: url('https://ik.imagekit.io/1irdz9lsyrw/plutusrender__3wykITPm.png?updatedAt=1638359431895');"
    class="section text-gray-300 min-h-screen "
  >
    <div
      class="container flex flex-col items-center px-5 py-16 mx-auto md:flex-row lg:px-28"
    >
      <div
        class="flex flex-col mt-20 items-start w-full pt-0 mb-16 text-left lg:flex-grow md:w-1/2 xl:mr-20 md:pr-24 md:mb-0 "
      >
        <h1
          class="mb-8 font-commorant text-2xl font-bold text-left text-gray-50  lg:text-4xl"
        >
          Funding for Society's Superheroes
        </h1>
        <p class="mb-8 text-base font-inter leading-relaxed text-left">
          We believe that not all superheroes wear capes, some wears medical outfits and some are at the ocean cleaning our mistakes. 
          Whoever they are and wherever they are, participate and help those who make the world a better place.
        </p>

        <div class=" items-start">
          <Sbutton on:click={async () => await goto("https://app-supaheroes.netlify.app/")}
            >Help a Superhero</Sbutton
          >
        </div>
      </div>
      <div class="w-full lg:w-5/6 lg:max-w-xl md:w-1/2 static" />
    </div>
  </section>
</div>
<Subsection />
<Section1 />
<Section2 />
<!-- <Section3/> -->
<Section4/>
