<script>
  import Sbutton from "@comp/sbutton.svelte";
  import "../app.postcss";
  import { onMount } from "svelte";
  import AOS from "aos";
import { goto } from "$app/navigation";

  let isExpanded = false;

  onMount(() => {
    AOS.init();
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
  });

  function toggle() {
    isExpanded = !isExpanded;
  }
</script>

<!-- Navbar -->
<div class="sticky top-0 z-50 items-center font-inter bg-supadark text-white antialiased ">
  <div
    class="items-center pt-4 justify-between w-full px-5 overflow-y-auto whitespace-nowrap scroll-hidden pb-4 border-b border-supadark-light"
  >
    <!-- Tablet nav -->
    <div class=" flex-col mx-auto md:hidden flex overflow-hidden">
      <div class=" flex flex-row">
        <h1
          class="text-center p-2 text-2xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-supagreen-dark to-supagreen transition duration-500 ease-in-out transform cursor-pointer hover:text-green-500 lg:text-x lg:mr-8"
        >
          Supaheroes
        </h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="24"
          height="24"
          viewBox="0 0 172 172"
          class="h-5 w-5 text-white fill-current self-center"
          on:click={toggle}
          style=" fill:#000000;"
          ><g
            fill="none"
            fill-rule="nonzero"
            stroke="none"
            stroke-width="1"
            stroke-linecap="butt"
            stroke-linejoin="miter"
            stroke-miterlimit="10"
            stroke-dasharray=""
            stroke-dashoffset="0"
            font-family="none"
            font-weight="none"
            font-size="none"
            text-anchor="none"
            style="mix-blend-mode: normal"
            ><path d="M0,172v-172h172v172z" fill="none" /><g fill="#ecf0f1"
              ><path
                d="M14.33333,35.83333v14.33333h143.33333v-14.33333zM14.33333,78.83333v14.33333h143.33333v-14.33333zM14.33333,121.83333v14.33333h143.33333v-14.33333z"
              /></g
            ></g
          ></svg
        >
      </div>

      {#if isExpanded}
        <nav
          class="flex flex-wrap items-center justify-start text-base bg-supadark-dark w-full p-3"
        >
          <ul class="items-center inline-block list-none lg:inline-flex">
            <li>
              <a
                href="/docs"
                class="px-4 py-1 mr-1 text-base text-blueGray-500 transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen "
                >Learn</a
              >
            </li>

            <li>
              <a
                href="/market"
                class="px-4 py-1 mr-1 text-base text-blueGray-500 transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen "
                >Governance</a
              >
            </li>
            <li>
              <a
                href="/protocol"
                class="px-4 py-1 mr-1 text-base text-blueGray-500 transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen "
                >Community</a
              >
            </li>
          </ul>
        </nav>
      {/if}
    </div>
    <!-- Desktop nav -->
    <div class="sticky top-0 z-50 w-full  md:grid grid-cols-12 hidden">
      <div
        href="/"
        class=" lg:px-6 col-span-2 align-bottom flex focus:outline-none"
      >
        <h2
          class="text-2xl font-athelas uppercase font-extrabold mx-auto pt-8 text-transparent bg-clip-text bg-gradient-to-r from-supagreen-dark to-supagreen transition duration-500 ease-in-out transform cursor-pointer hover:text-green-500 lg:text-x lg:mr-8"
        >
          Supaheroes
        </h2>
      </div>
      <nav class="flex col-span-8 ">
        <ul class="items-center mx-auto font-medium tracking-wide list-none inline-flex">
          <li>
            <a
              href="https://docs-supaheroes.netlify.app/"
              class="px-4 py-1 mr-1  transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen "
              >Learn</a
            >
          </li>

          <li>
            <a
              href="/Governance"
              class="px-4 py-1 mr-1 text-base  transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen "
              >Governance</a
            >
          </li>
          <li>
            <a
              href="/protocol"
              class="px-4 py-1 mr-1 text-base  transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen "
              >Community</a
            >
          </li>
        </ul>
      </nav>
      <div class="col-span-2 w-48 p-4 flex"><Sbutton on:click={async () => await goto("https://app-supaheroes.netlify.app/")}>Launch App</Sbutton></div>
    </div>
  </div>
</div>

<div class="min-h-screen relative bg-supadark">
  <slot />
</div>

<!-- Footer -->
<div class="items-center ">
  <footer
    class="text-gray-200 transition duration-500 ease-in-out transform bg-supadark border-t border-supadark-light"
  >
    <div class="flex flex-col flex-wrap justify-center p-5 md:flex-row">
      <nav
        class="flex flex-wrap items-center justify-center w-full mx-auto mb-6 text-base nprd"
      >
        <a
          href="/"
          class="px-4 py-1 mr-1 text-xs transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-black "
          >Hackathons</a
        >
        <a
          href="/"
          class="px-4 py-1 mr-1 text-xs  transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-black "
          >Ecosystem</a
        >
        <a
          href="/"
          class="px-4 py-1 mr-1 text-xs  transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-black "
          >Press</a
        >
        <a
          href="/"
          class="px-4 py-1 mr-1 text-xs transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-black "
          >FAQ</a
        >
      </nav>
      <span
        class="inline-flex justify-center w-full mx-auto mt-2 mr-2 sm:ml-auto sm:mt-0"
      >
        <a class="text-supagreen hover:text-black" href="/">
          <svg
            fill="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="w-5 h-5"
            viewBox="0 0 24 24"
          >
            <path
              d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
            />
          </svg>
        </a>
        <a class="ml-3 text-supagreen-dark hover:text-black" href="/">
          <svg
            fill="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="w-5 h-5"
            viewBox="0 0 24 24"
          >
            <path
              d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
            />
          </svg>
        </a>
        <a class="ml-3 text-supagreen hover:text-black" href="/">
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="w-5 h-5"
            viewBox="0 0 24 24"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path
              d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"
            />
          </svg>
        </a>
        <a class="ml-3 text-supagreen-dark hover:text-black" href="/">
          <svg
            fill="currentColor"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="0"
            class="w-5 h-5"
            viewBox="0 0 24 24"
          >
            <path
              stroke="none"
              d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
            />
            <circle cx="4" cy="4" r="2" stroke="none" />
          </svg>
        </a>
      </span>
    </div>
  </footer>
</div>

<style>
  button {
    outline: none;
  }
</style>
