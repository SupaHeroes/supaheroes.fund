const c = [
	() => import("../../../src/routes/__layout.svelte"),
	() => import("../components/error.svelte"),
	() => import("../../../src/routes/index.svelte"),
	() => import("../../../src/routes/subsection.svelte"),
	() => import("../../../src/routes/protocol/index.svelte"),
	() => import("../../../src/routes/section1.svelte"),
	() => import("../../../src/routes/section2.svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	// src/routes/subsection.svelte
	[/^\/subsection\/?$/, [c[0], c[3]], [c[1]]],

	// src/routes/protocol/index.svelte
	[/^\/protocol\/?$/, [c[0], c[4]], [c[1]]],

	// src/routes/section1.svelte
	[/^\/section1\/?$/, [c[0], c[5]], [c[1]]],

	// src/routes/section2.svelte
	[/^\/section2\/?$/, [c[0], c[6]], [c[1]]]
];

// we import the root layout/error components eagerly, so that
// connectivity errors after initialisation don't nuke the app
export const fallback = [c[0](), c[1]()];