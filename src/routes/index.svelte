<script>
  import { goto } from "$app/navigation";

  import Sbutton from "@comp/sbutton.svelte";
  import Section1 from "./section1.svelte";
  import Section2 from "./section2.svelte";
  import Section3 from "./section3.svelte";
  import Section4 from "./section4.svelte";
  import Subsection from "./subsection.svelte";
  import { Fullpage, FullpageSection, FullpageSlide } from "svelte-fullpage";

  //Optional, include all titles of your sections, this is also used as number that indicate count of sections
  const sections = ["Home", "History", "Present", "Next"];
  let activeSection = 0;

  
</script>

<Fullpage bind:activeSection arrows drag sectionTitles={sections}>
  <!-- Hero Section -->
  <FullpageSection slides={[]} transitionDuration={800}>
    <section
      style="background: url('/plutusbg.png'); background-position: center;
      background-repeat: no-repeat;
      background-size: cover;"
      class="text-gray-300 min-h-screen bg-supadark-dark"
    >
      <div
        class="flex flex-col items-center px-5 py-16 mx-auto md:flex-row lg:px-28 "
      >
        <div
          class="flex flex-col mt-24 items-start w-full pt-0 mb-16 text-left lg:flex-grow md:w-1/2 xl:mr-20 md:pr-24 md:mb-0 "
        >
          <h1
            class="mb-8 font-commorant uppercase text-2xl font-bold text-left text-white  lg:text-8xl"
          >
            Funding for Society's Superheroes
          </h1>

          <div class=" items-start text-lg">
            <Sbutton
              on:click={async () =>
                await goto("https://app-supaheroes.netlify.app/")}
              >Help a Superhero</Sbutton
            >
          </div>
        </div>
        <div class="w-full lg:w-5/6 lg:max-w-xl md:w-1/2 static" />
      </div>
    </section>
  </FullpageSection>
  <FullpageSection slides={[]} transitionDuration={800}>
    <FullpageSlide> <Section1 /></FullpageSlide>
   
  </FullpageSection>
  <FullpageSection slides={[]} transitionDuration={800}>
    <FullpageSlide><Section2 /></FullpageSlide>    
  </FullpageSection>

  <FullpageSection slides={[]} transitionDuration={800}>
    <Section4 />
  </FullpageSection>
  <!-- <Subsection /> -->

  <!-- <Section3/> -->
</Fullpage>
