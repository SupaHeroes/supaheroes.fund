import { respond } from '@sveltejs/kit/ssr';
import root from './generated/root.svelte';
import { set_paths, assets } from './runtime/paths.js';
import { set_prerendering } from './runtime/env.js';
import * as user_hooks from "./hooks.js";

const template = ({ head, body }) => "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n  <head>\r\n    <meta charset=\"utf-8\" />\r\n    <link rel=\"icon\" href=\"/logosupa.svg\" />\r\n    <link rel=\"stylesheet\" href=\"https://unpkg.com/aos@next/dist/aos.css\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n    <title>Supaheroes</title>\r\n    <link rel=\"manifest\" crossorigin=\"use-credentials\" href=\"/manifest.json\"/>\r\n    " + head + "\r\n  </head>\r\n  <body class=\"hidescroll bg-supadark\">\r\n    <div id=\"svelte\">" + body + "</div>\r\n  </body>\r\n</html>\r\n\r\n<style>\r\n  .hidescroll::-webkit-scrollbar {\r\n    display: none;\r\n}\r\n  input:focus {outline:0.5; outline-color: #DEFFEE;}\r\n  button:focus {outline:0.5; outline-color: #DEFFEE;}\r\n</style>\r\n";

let options = null;

const default_settings = { paths: {"base":"","assets":""} };

// allow paths to be overridden in svelte-kit preview
// and in prerendering
export function init(settings = default_settings) {
	set_paths(settings.paths);
	set_prerendering(settings.prerendering || false);

	const hooks = get_hooks(user_hooks);

	options = {
		amp: false,
		dev: false,
		entry: {
			file: assets + "/_app/start-97cca617.js",
			css: [assets + "/_app/assets/start-464e9d0a.css",assets + "/_app/assets/vendor-a36399ba.css"],
			js: [assets + "/_app/start-97cca617.js",assets + "/_app/chunks/vendor-c5ec5885.js",assets + "/_app/chunks/singletons-12a22614.js"]
		},
		fetched: undefined,
		floc: false,
		get_component_path: id => assets + "/_app/" + entry_lookup[id],
		get_stack: error => String(error), // for security
		handle_error: (error, request) => {
			hooks.handleError({ error, request });
			error.stack = options.get_stack(error);
		},
		hooks,
		hydrate: true,
		initiator: undefined,
		load_component,
		manifest,
		paths: settings.paths,
		prerender: true,
		read: settings.read,
		root,
		service_worker: '/service-worker.js',
		router: true,
		ssr: true,
		target: "#svelte",
		template,
		trailing_slash: "never"
	};
}

const d = decodeURIComponent;
const empty = () => ({});

const manifest = {
	assets: [{"file":"bg2.png","size":1558406,"type":"image/png"},{"file":"city.png","size":314697,"type":"image/png"},{"file":"economy.png","size":97687,"type":"image/png"},{"file":"logosupa.svg","size":442680,"type":"image/svg+xml"},{"file":"manifest.json","size":570,"type":"application/json"},{"file":"plutusbg.png","size":1489100,"type":"image/png"}],
	layout: "src/routes/__layout.svelte",
	error: ".svelte-kit/build/components/error.svelte",
	routes: [
		{
						type: 'page',
						pattern: /^\/$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
						b: [".svelte-kit/build/components/error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/governance\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/governance/index.svelte"],
						b: [".svelte-kit/build/components/error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/subsection\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/subsection.svelte"],
						b: [".svelte-kit/build/components/error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/protocol\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/protocol/index.svelte"],
						b: [".svelte-kit/build/components/error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/section1\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/section1.svelte"],
						b: [".svelte-kit/build/components/error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/section2\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/section2.svelte"],
						b: [".svelte-kit/build/components/error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/section3\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/section3.svelte"],
						b: [".svelte-kit/build/components/error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/section4\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/section4.svelte"],
						b: [".svelte-kit/build/components/error.svelte"]
					}
	]
};

// this looks redundant, but the indirection allows us to access
// named imports without triggering Rollup's missing import detection
const get_hooks = hooks => ({
	getSession: hooks.getSession || (() => ({})),
	handle: hooks.handle || (({ request, resolve }) => resolve(request)),
	handleError: hooks.handleError || (({ error }) => console.error(error.stack)),
	externalFetch: hooks.externalFetch || fetch
});

const module_lookup = {
	"src/routes/__layout.svelte": () => import("..\\..\\src\\routes\\__layout.svelte"),".svelte-kit/build/components/error.svelte": () => import("./components\\error.svelte"),"src/routes/index.svelte": () => import("..\\..\\src\\routes\\index.svelte"),"src/routes/governance/index.svelte": () => import("..\\..\\src\\routes\\governance\\index.svelte"),"src/routes/subsection.svelte": () => import("..\\..\\src\\routes\\subsection.svelte"),"src/routes/protocol/index.svelte": () => import("..\\..\\src\\routes\\protocol\\index.svelte"),"src/routes/section1.svelte": () => import("..\\..\\src\\routes\\section1.svelte"),"src/routes/section2.svelte": () => import("..\\..\\src\\routes\\section2.svelte"),"src/routes/section3.svelte": () => import("..\\..\\src\\routes\\section3.svelte"),"src/routes/section4.svelte": () => import("..\\..\\src\\routes\\section4.svelte")
};

const metadata_lookup = {"src/routes/__layout.svelte":{"entry":"pages/__layout.svelte-5f1c19d0.js","css":["assets/pages/__layout.svelte-fb9c0026.css","assets/vendor-a36399ba.css"],"js":["pages/__layout.svelte-5f1c19d0.js","chunks/vendor-c5ec5885.js","chunks/sbutton-2227e717.js","chunks/navigation-51f4a605.js","chunks/singletons-12a22614.js"],"styles":[]},".svelte-kit/build/components/error.svelte":{"entry":"error.svelte-6e465d37.js","css":["assets/vendor-a36399ba.css"],"js":["error.svelte-6e465d37.js","chunks/vendor-c5ec5885.js"],"styles":[]},"src/routes/index.svelte":{"entry":"pages/index.svelte-f34bb59b.js","css":["assets/vendor-a36399ba.css"],"js":["pages/index.svelte-f34bb59b.js","chunks/vendor-c5ec5885.js","chunks/navigation-51f4a605.js","chunks/singletons-12a22614.js","chunks/sbutton-2227e717.js","pages/section1.svelte-e2e91444.js","pages/section2.svelte-d4ff7816.js","pages/section4.svelte-a18153c5.js"],"styles":[]},"src/routes/governance/index.svelte":{"entry":"pages/governance/index.svelte-dd6675f1.js","css":["assets/vendor-a36399ba.css"],"js":["pages/governance/index.svelte-dd6675f1.js","chunks/vendor-c5ec5885.js"],"styles":[]},"src/routes/subsection.svelte":{"entry":"pages/subsection.svelte-7528dd14.js","css":["assets/vendor-a36399ba.css"],"js":["pages/subsection.svelte-7528dd14.js","chunks/vendor-c5ec5885.js"],"styles":[]},"src/routes/protocol/index.svelte":{"entry":"pages/protocol/index.svelte-495a5b77.js","css":["assets/vendor-a36399ba.css"],"js":["pages/protocol/index.svelte-495a5b77.js","chunks/vendor-c5ec5885.js","chunks/sbutton-2227e717.js"],"styles":[]},"src/routes/section1.svelte":{"entry":"pages/section1.svelte-e2e91444.js","css":["assets/vendor-a36399ba.css"],"js":["pages/section1.svelte-e2e91444.js","chunks/vendor-c5ec5885.js"],"styles":[]},"src/routes/section2.svelte":{"entry":"pages/section2.svelte-d4ff7816.js","css":["assets/vendor-a36399ba.css"],"js":["pages/section2.svelte-d4ff7816.js","chunks/vendor-c5ec5885.js"],"styles":[]},"src/routes/section3.svelte":{"entry":"pages/section3.svelte-c7feda01.js","css":["assets/vendor-a36399ba.css"],"js":["pages/section3.svelte-c7feda01.js","chunks/vendor-c5ec5885.js"],"styles":[]},"src/routes/section4.svelte":{"entry":"pages/section4.svelte-a18153c5.js","css":["assets/vendor-a36399ba.css"],"js":["pages/section4.svelte-a18153c5.js","chunks/vendor-c5ec5885.js"],"styles":[]}};

async function load_component(file) {
	const { entry, css, js, styles } = metadata_lookup[file];
	return {
		module: await module_lookup[file](),
		entry: assets + "/_app/" + entry,
		css: css.map(dep => assets + "/_app/" + dep),
		js: js.map(dep => assets + "/_app/" + dep),
		styles
	};
}

export function render(request, {
	prerender
} = {}) {
	const host = request.headers["host"];
	return respond({ ...request, host }, options, { prerender });
}