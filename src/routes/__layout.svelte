<script>
  import "../app.postcss";
  import Sbutton from "@comp/sbutton.svelte";
  import { goto } from "$app/navigation";

  let isExpanded = false;

  function toggle() {
    isExpanded = !isExpanded;
  }
</script>

 <!-- Navbar -->
 <div
 class="sticky top-0 z-50 items-center font-inter bg-transparent text-white antialiased "
>
 <div
   class="items-center pt-4 justify-between w-full px-5 overflow-y-auto whitespace-nowrap scroll-hidden pb-4 "
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
   <div
     class="top-0 z-50 w-full overflow-hidden  md:grid grid-cols-12 hidden"
   >
     <div class=" lg:px-6 col-span-2 align-bottom flex focus:outline-none">
       <img src="/logosupa.svg" width="84" height="45" alt="logo" />
       <a
         href="/"
         class="text-2xl pl-2 font-athelas uppercase font-extrabold mx-auto pt-8 bg-clip-text text-supagreen-dark transition duration-500 ease-in-out transform cursor-pointer hover:text-green-500 lg:text-x lg:mr-8"
       >
         Supaheroes
       </a>
     </div>
     <nav class="flex col-span-8 ">
       <ul
         class="items-center mx-auto font-medium tracking-wide list-none inline-flex"
       >
         <li>
           <a
             href="https://docs.supaheroes.fund/"
             class="px-4 py-1 mr-1  transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen-dark "
             >Learn</a
           >
         </li>

         <li>
           <a
             href="/governance"
             class="px-4 py-1 mr-1 text-base transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen-dark "
             >Governance</a
           >
         </li>
         <li>
           <a
             href="https://twitter.com/SupaheroesFund"
             class="px-4 py-1 mr-1 text-base  transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen-dark "
             >Community</a
           >
         </li>
       </ul>
     </nav>
     <div class="col-span-2 w-48 p-4 text-supadark-black flex">
       <Sbutton
         on:click={async () =>
           await goto("https://app.supaheroes.fund/")}
         >Launch App</Sbutton
       >
     </div>
   </div>
 </div>
</div>


<div class="bg-supadark">
    <slot />
</div>


