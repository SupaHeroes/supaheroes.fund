import { respond } from '@sveltejs/kit/ssr';
import root from './generated/root.svelte';
import { set_paths, assets } from './runtime/paths.js';
import { set_prerendering } from './runtime/env.js';
import * as user_hooks from "./hooks.js";

const template = ({ head, body }) => "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <link rel=\"icon\" href=\"/favicon.png\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Supaheroes</title>\n    <link rel=\"manifest\" crossorigin=\"use-credentials\" href=\"/manifest.json\"/>\n    " + head + "\n  </head>\n  <body class=\"font-noto hidescroll\">\n    <div id=\"svelte\">" + body + "</div>\n  </body>\n</html>\n\n<style>\n  .hidescroll::-webkit-scrollbar {\n    display: none;\n}\n  input:focus {outline:0.5; outline-color: #DEFFEE;}\n  button:focus {outline:0.5; outline-color: #DEFFEE;}\n</style>\n";

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
			file: assets + "/_app/start-f4f3e66f.js",
			css: [assets + "/_app/assets/start-464e9d0a.css"],
			js: [assets + "/_app/start-f4f3e66f.js",assets + "/_app/chunks/vendor-5e46aa75.js",assets + "/_app/chunks/singletons-12a22614.js"]
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
	assets: [{"file":"favicon.png","size":72072,"type":"image/png"},{"file":"manifest.json","size":553,"type":"application/json"}],
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
	"src/routes/__layout.svelte": () => import("../../src/routes/__layout.svelte"),".svelte-kit/build/components/error.svelte": () => import("./components/error.svelte"),"src/routes/index.svelte": () => import("../../src/routes/index.svelte"),"src/routes/subsection.svelte": () => import("../../src/routes/subsection.svelte"),"src/routes/protocol/index.svelte": () => import("../../src/routes/protocol/index.svelte"),"src/routes/section1.svelte": () => import("../../src/routes/section1.svelte"),"src/routes/section2.svelte": () => import("../../src/routes/section2.svelte")
};

const metadata_lookup = {"src/routes/__layout.svelte":{"entry":"pages/__layout.svelte-7eab79bf.js","css":["assets/pages/__layout.svelte-5e36db80.css"],"js":["pages/__layout.svelte-7eab79bf.js","chunks/vendor-5e46aa75.js","chunks/sbutton-b1ed063a.js"],"styles":[]},".svelte-kit/build/components/error.svelte":{"entry":"error.svelte-12bf3fc6.js","css":[],"js":["error.svelte-12bf3fc6.js","chunks/vendor-5e46aa75.js"],"styles":[]},"src/routes/index.svelte":{"entry":"pages/index.svelte-878e67e1.js","css":[],"js":["pages/index.svelte-878e67e1.js","chunks/vendor-5e46aa75.js","chunks/singletons-12a22614.js","chunks/sbutton-b1ed063a.js","pages/section1.svelte-57e8d2c1.js","pages/section2.svelte-83727071.js","pages/subsection.svelte-386e495a.js"],"styles":[]},"src/routes/subsection.svelte":{"entry":"pages/subsection.svelte-386e495a.js","css":[],"js":["pages/subsection.svelte-386e495a.js","chunks/vendor-5e46aa75.js"],"styles":[]},"src/routes/protocol/index.svelte":{"entry":"pages/protocol/index.svelte-f8d0bd56.js","css":[],"js":["pages/protocol/index.svelte-f8d0bd56.js","chunks/vendor-5e46aa75.js","chunks/sbutton-b1ed063a.js"],"styles":[]},"src/routes/section1.svelte":{"entry":"pages/section1.svelte-57e8d2c1.js","css":[],"js":["pages/section1.svelte-57e8d2c1.js","chunks/vendor-5e46aa75.js","chunks/sbutton-b1ed063a.js"],"styles":[]},"src/routes/section2.svelte":{"entry":"pages/section2.svelte-83727071.js","css":[],"js":["pages/section2.svelte-83727071.js","chunks/vendor-5e46aa75.js"],"styles":[]}};

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