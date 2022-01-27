var __require = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal$1(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
const subscriber_queue$1 = [];
function writable$1(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal$1(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue$1.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue$1.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue$1.length; i += 2) {
            subscriber_queue$1[i][0](subscriber_queue$1[i + 1]);
          }
          subscriber_queue$1.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
const s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable$1($session);
    const props = {
      stores: {
        page: writable$1(null),
        navigating: writable$1(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
const s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape$1(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
const escaped$2 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape$1(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$2) {
      result += escaped$2[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
const absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    context: node_loaded.context,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
class ReadOnlyFormData {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
}
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(request2.path);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
const escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var root_svelte_svelte_type_style_lang = "#svelte-announcer.svelte-1pdgbjn{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}";
const css$5 = {
  code: "#svelte-announcer.svelte-1pdgbjn{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>#svelte-announcer{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}</style>"],"names":[],"mappings":"AAqDO,gCAAiB,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,kBAAkB,MAAM,GAAG,CAAC,CAAC,UAAU,MAAM,GAAG,CAAC,CAAC,OAAO,GAAG,CAAC,KAAK,CAAC,CAAC,SAAS,MAAM,CAAC,SAAS,QAAQ,CAAC,IAAI,CAAC,CAAC,YAAY,MAAM,CAAC,MAAM,GAAG,CAAC"}`
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$5);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
let base = "";
let assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
const template = ({ head, body }) => '<!DOCTYPE html>\r\n<html lang="en">\r\n  <head>\r\n    <meta charset="utf-8" />\r\n    <link rel="icon" href="/logosupa.svg" />\r\n    <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />\r\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\r\n    <title>Supaheroes</title>\r\n    <link rel="manifest" crossorigin="use-credentials" href="/manifest.json"/>\r\n    ' + head + '\r\n  </head>\r\n  <body class="hidescroll bg-supadark">\r\n    <div id="svelte">' + body + "</div>\r\n  </body>\r\n</html>\r\n\r\n<style>\r\n  .hidescroll::-webkit-scrollbar {\r\n    display: none;\r\n}\r\n  input:focus {outline:0.5; outline-color: #DEFFEE;}\r\n  button:focus {outline:0.5; outline-color: #DEFFEE;}\r\n</style>\r\n";
let options = null;
const default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-97cca617.js",
      css: [assets + "/_app/assets/start-464e9d0a.css", assets + "/_app/assets/vendor-a36399ba.css"],
      js: [assets + "/_app/start-97cca617.js", assets + "/_app/chunks/vendor-c5ec5885.js", assets + "/_app/chunks/singletons-12a22614.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: "/service-worker.js",
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
const empty = () => ({});
const manifest = {
  assets: [{ "file": "bg2.png", "size": 1558406, "type": "image/png" }, { "file": "city.png", "size": 314697, "type": "image/png" }, { "file": "economy.png", "size": 97687, "type": "image/png" }, { "file": "logosupa.svg", "size": 442680, "type": "image/svg+xml" }, { "file": "manifest.json", "size": 570, "type": "application/json" }, { "file": "plutusbg.png", "size": 1489100, "type": "image/png" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/governance\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/governance/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/subsection\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/subsection.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/protocol\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/protocol/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/section1\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/section1.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/section2\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/section2.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/section3\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/section3.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/section4\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/section4.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
const get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
const module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$2;
  }),
  "src/routes/governance/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/subsection.svelte": () => Promise.resolve().then(function() {
    return subsection;
  }),
  "src/routes/protocol/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/section1.svelte": () => Promise.resolve().then(function() {
    return section1;
  }),
  "src/routes/section2.svelte": () => Promise.resolve().then(function() {
    return section2;
  }),
  "src/routes/section3.svelte": () => Promise.resolve().then(function() {
    return section3;
  }),
  "src/routes/section4.svelte": () => Promise.resolve().then(function() {
    return section4;
  })
};
const metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-5f1c19d0.js", "css": ["assets/pages/__layout.svelte-fb9c0026.css", "assets/vendor-a36399ba.css"], "js": ["pages/__layout.svelte-5f1c19d0.js", "chunks/vendor-c5ec5885.js", "chunks/sbutton-2227e717.js", "chunks/navigation-51f4a605.js", "chunks/singletons-12a22614.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-6e465d37.js", "css": ["assets/vendor-a36399ba.css"], "js": ["error.svelte-6e465d37.js", "chunks/vendor-c5ec5885.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-f34bb59b.js", "css": ["assets/vendor-a36399ba.css"], "js": ["pages/index.svelte-f34bb59b.js", "chunks/vendor-c5ec5885.js", "chunks/navigation-51f4a605.js", "chunks/singletons-12a22614.js", "chunks/sbutton-2227e717.js", "pages/section1.svelte-e2e91444.js", "pages/section2.svelte-d4ff7816.js", "pages/section4.svelte-a18153c5.js"], "styles": [] }, "src/routes/governance/index.svelte": { "entry": "pages/governance/index.svelte-dd6675f1.js", "css": ["assets/vendor-a36399ba.css"], "js": ["pages/governance/index.svelte-dd6675f1.js", "chunks/vendor-c5ec5885.js"], "styles": [] }, "src/routes/subsection.svelte": { "entry": "pages/subsection.svelte-7528dd14.js", "css": ["assets/vendor-a36399ba.css"], "js": ["pages/subsection.svelte-7528dd14.js", "chunks/vendor-c5ec5885.js"], "styles": [] }, "src/routes/protocol/index.svelte": { "entry": "pages/protocol/index.svelte-495a5b77.js", "css": ["assets/vendor-a36399ba.css"], "js": ["pages/protocol/index.svelte-495a5b77.js", "chunks/vendor-c5ec5885.js", "chunks/sbutton-2227e717.js"], "styles": [] }, "src/routes/section1.svelte": { "entry": "pages/section1.svelte-e2e91444.js", "css": ["assets/vendor-a36399ba.css"], "js": ["pages/section1.svelte-e2e91444.js", "chunks/vendor-c5ec5885.js"], "styles": [] }, "src/routes/section2.svelte": { "entry": "pages/section2.svelte-d4ff7816.js", "css": ["assets/vendor-a36399ba.css"], "js": ["pages/section2.svelte-d4ff7816.js", "chunks/vendor-c5ec5885.js"], "styles": [] }, "src/routes/section3.svelte": { "entry": "pages/section3.svelte-c7feda01.js", "css": ["assets/vendor-a36399ba.css"], "js": ["pages/section3.svelte-c7feda01.js", "chunks/vendor-c5ec5885.js"], "styles": [] }, "src/routes/section4.svelte": { "entry": "pages/section4.svelte-a18153c5.js", "css": ["assets/vendor-a36399ba.css"], "js": ["pages/section4.svelte-a18153c5.js", "chunks/vendor-c5ec5885.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var app = '@import url("https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@300;400;500;600;700&display=swap");\n/*! tailwindcss v2.2.15 | MIT License | https://tailwindcss.com*/\n/*! modern-normalize v1.1.0 | MIT License | https://github.com/sindresorhus/modern-normalize */html{-webkit-text-size-adjust:100%;line-height:1.15;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;margin:0}hr{color:inherit;height:0}abbr[title]{-webkit-text-decoration:underline dotted;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-color:inherit;text-indent:0}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}::-moz-focus-inner{border-style:none;padding:0}:-moz-focusring{outline:1px dotted ButtonText}:-moz-ui-invalid{box-shadow:none}legend{padding:0}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}button{background-color:transparent;background-image:none}fieldset,ol,ul{margin:0;padding:0}ol,ul{list-style:none}html{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5}body{font-family:inherit;line-height:inherit}*,:after,:before{border:0 solid;box-sizing:border-box}hr{border-top-width:1px}img{border-style:solid}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{color:#9ca3af;opacity:1}input:-ms-input-placeholder,textarea:-ms-input-placeholder{color:#9ca3af;opacity:1}input::placeholder,textarea::placeholder{color:#9ca3af;opacity:1}[role=button],button{cursor:pointer}:-moz-focusring{outline:auto}table{border-collapse:collapse}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}button,input,optgroup,select,textarea{color:inherit;line-height:inherit;padding:0}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{height:auto;max-width:100%}[hidden]{display:none}*,:after,:before{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-transform:translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));--tw-border-opacity:1;--tw-ring-inset:var(--tw-empty,/*!*/ /*!*/);--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,0.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;border-color:rgba(229,231,235,var(--tw-border-opacity))}.container{width:100%}@media (min-width:640px){.container{max-width:640px}}@media (min-width:768px){.container{max-width:768px}}@media (min-width:1024px){.container{max-width:1024px}}@media (min-width:1280px){.container{max-width:1280px}}@media (min-width:1536px){.container{max-width:1536px}}.static{position:static}.sticky{position:sticky}.top-0{top:0}.z-50{z-index:50}.col-span-4{grid-column:span 4/span 4}.col-span-2{grid-column:span 2/span 2}.col-span-8{grid-column:span 8/span 8}.my-2{margin-bottom:.5rem;margin-top:.5rem}.mx-auto{margin-left:auto;margin-right:auto}.my-24{margin-bottom:6rem;margin-top:6rem}.my-auto{margin-bottom:auto;margin-top:auto}.ml-auto{margin-left:auto}.mb-2{margin-bottom:.5rem}.mt-24{margin-top:6rem}.mb-16{margin-bottom:4rem}.mb-8{margin-bottom:2rem}.mt-8{margin-top:2rem}.mt-2{margin-top:.5rem}.mr-2{margin-right:.5rem}.mr-1{margin-right:.25rem}.mt-6{margin-top:1.5rem}.mt-4{margin-top:1rem}.mt-3{margin-top:.75rem}.mt-10{margin-top:2.5rem}.inline-block{display:inline-block}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.hidden{display:none}.h-10{height:2.5rem}.h-screen{height:100vh}.h-5{height:1.25rem}.h-44{height:11rem}.h-64{height:16rem}.min-h-screen{min-height:100vh}.w-full{width:100%}.w-1\\/2{width:50%}.w-3\\/4{width:75%}.w-5{width:1.25rem}.w-48{width:12rem}.max-w-2xl{max-width:42rem}.max-w-4xl{max-width:56rem}.max-w-lg{max-width:32rem}.max-w-sm{max-width:24rem}.transform{transform:var(--tw-transform)}.cursor-pointer{cursor:pointer}.list-none{list-style-type:none}.appearance-none{-webkit-appearance:none;-moz-appearance:none;appearance:none}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}.flex-row{flex-direction:row}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-start{justify-content:flex-start}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-12{gap:3rem}.self-center{align-self:center}.overflow-hidden{overflow:hidden}.overflow-y-auto{overflow-y:auto}.whitespace-nowrap{white-space:nowrap}.rounded-md{border-radius:.375rem}.rounded-full{border-radius:9999px}.rounded{border-radius:.25rem}.rounded-xl{border-radius:.75rem}.border{border-width:1px}.border-b{border-bottom-width:1px}.border-t{border-top-width:1px}.border-supagreen-dark{--tw-border-opacity:1;border-color:rgba(121,211,138,var(--tw-border-opacity))}.border-gray-700{--tw-border-opacity:1;border-color:rgba(55,65,81,var(--tw-border-opacity))}.border-gray-400{--tw-border-opacity:1;border-color:rgba(156,163,175,var(--tw-border-opacity))}.border-supadark-light{--tw-border-opacity:1;border-color:rgba(48,48,48,var(--tw-border-opacity))}.bg-supadark{--tw-bg-opacity:1;background-color:rgba(13,16,22,var(--tw-bg-opacity))}.bg-transparent{background-color:transparent}.bg-supadark-dark{--tw-bg-opacity:1;background-color:rgba(13,16,22,var(--tw-bg-opacity))}.bg-gray-600{--tw-bg-opacity:1;background-color:rgba(75,85,99,var(--tw-bg-opacity))}.bg-supagreen{--tw-bg-opacity:1;background-color:rgba(38,155,168,var(--tw-bg-opacity))}.bg-green-900{--tw-bg-opacity:1;background-color:rgba(6,78,59,var(--tw-bg-opacity))}.bg-supagreen-dark{--tw-bg-opacity:1;background-color:rgba(121,211,138,var(--tw-bg-opacity))}.bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}.from-supagreen-dark{--tw-gradient-from:#79d38a;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,rgba(121,211,138,0))}.to-supagreen{--tw-gradient-to:#269ba8}.bg-clip-text{-webkit-background-clip:text;background-clip:text}.fill-current{fill:currentColor}.p-1{padding:.25rem}.p-10{padding:2.5rem}.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.py-2{padding-bottom:.5rem;padding-top:.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}.py-1{padding-bottom:.25rem;padding-top:.25rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.py-16{padding-bottom:4rem;padding-top:4rem}.px-4{padding-left:1rem;padding-right:1rem}.pl-3{padding-left:.75rem}.pr-2{padding-right:.5rem}.pt-0{padding-top:0}.pb-4{padding-bottom:1rem}.pt-4{padding-top:1rem}.pt-2{padding-top:.5rem}.pt-16{padding-top:4rem}.pl-2{padding-left:.5rem}.pt-8{padding-top:2rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.align-bottom{vertical-align:bottom}.font-inter{font-family:Inter}.font-commorant{font-family:Cormorant SC}.font-athelas{font-family:Athelas}.text-sm{font-size:.875rem;line-height:1.25rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-8xl{font-size:6rem;line-height:1}.text-5xl{font-size:3rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.font-bold{font-weight:700}.font-black{font-weight:900}.font-thin{font-weight:100}.font-medium{font-weight:500}.font-extrabold{font-weight:800}.uppercase{text-transform:uppercase}.tracking-wider{letter-spacing:.05em}.tracking-widest{letter-spacing:.1em}.tracking-tighter{letter-spacing:-.05em}.tracking-wide{letter-spacing:.025em}.text-white{--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))}.text-gray-300{--tw-text-opacity:1;color:rgba(209,213,219,var(--tw-text-opacity))}.text-gray-50{--tw-text-opacity:1;color:rgba(249,250,251,var(--tw-text-opacity))}.text-gray-400{--tw-text-opacity:1;color:rgba(156,163,175,var(--tw-text-opacity))}.text-gray-200{--tw-text-opacity:1;color:rgba(229,231,235,var(--tw-text-opacity))}.text-supagreen-dark{--tw-text-opacity:1;color:rgba(121,211,138,var(--tw-text-opacity))}.text-supadark{--tw-text-opacity:1;color:rgba(13,16,22,var(--tw-text-opacity))}.text-transparent{color:transparent}.text-supadark-light{--tw-text-opacity:1;color:rgba(48,48,48,var(--tw-text-opacity))}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.outline-none{outline:2px solid transparent;outline-offset:2px}.ring-offset-2{--tw-ring-offset-width:2px}.ring-offset-current{--tw-ring-offset-color:currentColor}.transition{transition-duration:.15s;transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1)}.duration-500{transition-duration:.5s}.ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}.hover\\:text-supagreen-dark:hover{--tw-text-opacity:1;color:rgba(121,211,138,var(--tw-text-opacity))}.hover\\:text-black:hover{--tw-text-opacity:1;color:rgba(0,0,0,var(--tw-text-opacity))}.hover\\:text-green-500:hover{--tw-text-opacity:1;color:rgba(16,185,129,var(--tw-text-opacity))}.hover\\:text-supagreen:hover{--tw-text-opacity:1;color:rgba(38,155,168,var(--tw-text-opacity))}.focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}.focus\\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.active\\:outline-none:active{outline:2px solid transparent;outline-offset:2px}@media (min-width:640px){.sm\\:ml-auto{margin-left:auto}.sm\\:mt-0{margin-top:0}}@media (min-width:768px){.md\\:mb-0{margin-bottom:0}.md\\:grid{display:grid}.md\\:hidden{display:none}.md\\:w-1\\/2{width:50%}.md\\:w-4\\/5{width:80%}.md\\:flex-row{flex-direction:row}.md\\:pr-24{padding-right:6rem}.md\\:text-4xl{font-size:2.25rem;line-height:2.5rem}}@media (min-width:1024px){.lg\\:mr-8{margin-right:2rem}.lg\\:inline-flex{display:inline-flex}.lg\\:w-5\\/6{width:83.333333%}.lg\\:max-w-xl{max-width:36rem}.lg\\:flex-grow{flex-grow:1}.lg\\:px-28{padding-left:7rem;padding-right:7rem}.lg\\:px-6{padding-left:1.5rem;padding-right:1.5rem}.lg\\:text-8xl{font-size:6rem;line-height:1}}@media (min-width:1280px){.xl\\:mr-20{margin-right:5rem}}';
const Sbutton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<button class="${"w-full p-1 my-2 ml-auto font-bold text-sm tracking-wider transition duration-500 ease-in-out transform bg-gradient-to-r bg-transparent border border-supagreen-dark focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:b-gblue-700"}"><div class="${"font-inter uppercase px-6 py-2 hover:text-supagreen-dark"}">${slots.default ? slots.default({}) : ``}</div></button>`;
});
const _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `
 <div class="${"sticky top-0 z-50 items-center font-inter bg-transparent text-white antialiased "}"><div class="${"items-center pt-4 justify-between w-full px-5 overflow-y-auto whitespace-nowrap scroll-hidden pb-4 "}">
   <div class="${"flex-col mx-auto md:hidden flex overflow-hidden"}"><div class="${"flex flex-row"}"><h1 class="${"text-center p-2 text-2xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-supagreen-dark to-supagreen transition duration-500 ease-in-out transform cursor-pointer hover:text-green-500 lg:text-x lg:mr-8"}">Supaheroes
       </h1>
       <svg xmlns="${"http://www.w3.org/2000/svg"}" x="${"0px"}" y="${"0px"}" width="${"24"}" height="${"24"}" viewBox="${"0 0 172 172"}" class="${"h-5 w-5 text-white fill-current self-center"}" style="${"fill:#000000;"}"><g fill="${"none"}" fill-rule="${"nonzero"}" stroke="${"none"}" stroke-width="${"1"}" stroke-linecap="${"butt"}" stroke-linejoin="${"miter"}" stroke-miterlimit="${"10"}" stroke-dasharray="${""}" stroke-dashoffset="${"0"}" font-family="${"none"}" font-weight="${"none"}" font-size="${"none"}" text-anchor="${"none"}" style="${"mix-blend-mode: normal"}"><path d="${"M0,172v-172h172v172z"}" fill="${"none"}"></path><g fill="${"#ecf0f1"}"><path d="${"M14.33333,35.83333v14.33333h143.33333v-14.33333zM14.33333,78.83333v14.33333h143.33333v-14.33333zM14.33333,121.83333v14.33333h143.33333v-14.33333z"}"></path></g></g></svg></div>

     ${``}</div>
   
   <div class="${"top-0 z-50 w-full overflow-hidden md:grid grid-cols-12 hidden"}"><div class="${"lg:px-6 col-span-2 align-bottom flex focus:outline-none"}"><img src="${"/logosupa.svg"}" width="${"84"}" height="${"45"}" alt="${"logo"}">
       <a href="${"/"}" class="${"text-2xl pl-2 font-athelas uppercase font-extrabold mx-auto pt-8 bg-clip-text text-supagreen-dark transition duration-500 ease-in-out transform cursor-pointer hover:text-green-500 lg:text-x lg:mr-8"}">Supaheroes
       </a></div>
     <nav class="${"flex col-span-8 "}"><ul class="${"items-center mx-auto font-medium tracking-wide list-none inline-flex"}"><li><a href="${"https://docs-supaheroes.netlify.app/"}" class="${"px-4 py-1 mr-1 transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen-dark "}">Learn</a></li>

         <li><a href="${"/governance"}" class="${"px-4 py-1 mr-1 text-base transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen-dark "}">Governance</a></li>
         <li><a href="${"https://twitter.com/SupaheroesFund"}" class="${"px-4 py-1 mr-1 text-base transition duration-500 ease-in-out transform rounded-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-supagreen-dark "}">Community</a></li></ul></nav>
     <div class="${"col-span-2 w-48 p-4 text-supadark-black flex"}">${validate_component(Sbutton, "Sbutton").$$render($$result, {}, {}, { default: () => `Launch App` })}</div></div></div></div>


<div class="${"bg-supadark"}">${slots.default ? slots.default({}) : ``}</div>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load({ error: error2, status }) {
  return { props: { error: error2, status } };
}
const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
const Section1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"section bg-green-900"}"><div class="${"min-h-screen flex flex-col items-center justify-center"}"><div class="${"w-1/2 mx-auto"}"><p class="${"text-gray-50 w-full mx-auto font-bold text-center font-commorant uppercase border-b pb-4 text-4xl border-supagreen-dark"}">Success Helps Others
    </p>
    <p class="${"text-gray-300 w-full mx-auto text-center font-inter uppercase text-lg pt-4"}">Your Success directly contributes to Public Goods fund \u{1F496}
    </p></div>

  <div class="${"w-full mx-auto"}"><img class="${"mx-auto"}" width="${"80%"}" height="${"50%"}" src="${"economy.png"}" alt="${""}"></div></div></section>`;
});
var section1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Section1
});
const Section2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"section bg-green-900"}"><div style="${"background: url(/bg2.png);"}" class="${"mx-auto h-screen overflow-hidden w-full items-center justify-center flex flex-col"}"><div class="${"w-3/4 flex flex-row mx-auto"}"><div class="${"w-1/2"}"><h1 class="${"text-8xl font-commorant text-white uppercase font-black"}">DeFi &amp; NFT</h1></div>
      <div class="${"w-1/2"}"><p class="${"font-inter text-white uppercase font-bold tracking-widest"}">Maximum web3 Experience</p>
        <p class="${"font-inter text-gray-300 pt-2"}">Experience crowdfunding with DeFi and NFT connected to your campaign. Let the latest financial innovations help you reach your crowdfunding goal while also providing the best crypto experience through NFT.</p></div></div>
    <div class="${"border-t w-3/4 my-24 border-gray-400"}"></div>
    <div class="${"w-3/4 flex flex-row mx-auto"}"><div class="${"w-1/2"}"><p class="${"font-inter text-white uppercase font-bold tracking-widest"}">Open Participation and Governance</p>
        <p class="${"font-inter text-gray-300 pt-2"}">Supaheroes mechanism allow permissionless participation from anyone in the world without KYC or country restrictions. The platform relies on proof of ownership and democratic consensus.</p></div>
      <div class="${"w-1/2 text-right"}"><h1 class="${"text-8xl font-commorant text-white uppercase font-black"}">Public</h1></div></div></div></section>`;
});
var section2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Section2
});
const Section4 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section style="${"height: 95vh"}" class="${"section flex justify-center items-center"}"><div class="${"mx-auto text-white rounded-xl p-10"}"><img width="${"800"}" height="${"800"}" class="${"mx-auto"}" src="${"https://ik.imagekit.io/1irdz9lsyrw/greek_P8indg2J_Jz.png?updatedAt=1638371193515"}" alt="${""}">
      <p class="${"font-commorant uppercase mt-8 text-5xl font-bold text-center"}">House of The DAO Coming Soon
      </p>
      <p class="${"font-inter mt-2 text-xl text-gray-400 tracking-widest text-center"}">Public governance for Supaheroes
       </p></div></section>
  
  
<div class="${""}"><footer class="${"text-gray-200 transition duration-500 ease-in-out transform bg-supadark border-t border-supadark-light"}"><div class="${"flex px-5 py-2 flex-row"}"><h1 class="${"pt-2 text-sm"}">\xA9 Supaheroes DAO</h1>
      <span class="${"mt-2 pt-2 mr-2 sm:ml-auto sm:mt-0"}"><a class="${"text-supagreen-dark hover:text-black"}" href="${"https://twitter.com/SupaheroesFund"}"><svg fill="${"currentColor"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" class="${"w-5 h-5"}" viewBox="${"0 0 24 24"}"><path d="${"M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"}"></path></svg></a></span></div></footer></div>`;
});
var section4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Section4
});
var Dot_svelte_svelte_type_style_lang = ".svelte-fp-indicator-list-item.svelte-1ol7yt2{align-items:center;display:flex;margin:1rem;padding:0}.svelte-fp-indicator-list-item-btn.svelte-1ol7yt2{align-self:end;background-color:transparent;border:1px solid #767676;border-radius:.5rem;height:1rem;order:1;width:1rem}.svelte-fp-active.svelte-1ol7yt2{background-color:#767676}.svelte-fp-slide-name.svelte-1ol7yt2{background:rgba(78,85,91,.82);border:1px #4e555b;border-radius:3px;justify-self:start;margin:2rem;order:0;padding:2px;position:absolute;text-align:center}@media only screen and (max-width:600px){.svelte-fp-indicator-list-item-btn.svelte-1ol7yt2{border-radius:.25rem;height:.5rem;width:.5rem}}";
const css$4 = {
  code: ".svelte-fp-indicator-list-item.svelte-1ol7yt2{align-items:center;display:flex;margin:1rem;padding:0}.svelte-fp-indicator-list-item-btn.svelte-1ol7yt2{align-self:end;background-color:transparent;border:1px solid #767676;border-radius:.5rem;height:1rem;order:1;width:1rem}.svelte-fp-active.svelte-1ol7yt2{background-color:#767676}.svelte-fp-slide-name.svelte-1ol7yt2{background:rgba(78,85,91,.82);border:1px #4e555b;border-radius:3px;justify-self:start;margin:2rem;order:0;padding:2px;position:absolute;text-align:center}@media only screen and (max-width:600px){.svelte-fp-indicator-list-item-btn.svelte-1ol7yt2{border-radius:.25rem;height:.5rem;width:.5rem}}",
  map: `{"version":3,"file":"Dot.svelte","sources":["Dot.svelte"],"sourcesContent":["<script>\\n    export let activeSection = 0;\\n    export let index = 0;\\n    export let name = '';\\n    export let names = false;\\n\\n    const goto = () => {\\n        activeSection = index;\\n    }\\n<\/script>\\n\\n<li class=\\"svelte-fp-indicator-list-item\\">\\n    {#if names}\\n        <p class=\\"svelte-fp-slide-name\\">\\n            {name}\\n        </p>\\n    {/if}\\n    <button class=\\"svelte-fp-indicator-list-item-btn {activeSection === index ? 'svelte-fp-active':''}\\" on:click={goto}>\\n    </button>\\n</li>\\n\\n<style>.svelte-fp-indicator-list-item{align-items:center;display:flex;margin:1rem;padding:0}.svelte-fp-indicator-list-item-btn{align-self:end;background-color:transparent;border:1px solid #767676;border-radius:.5rem;height:1rem;order:1;width:1rem}.svelte-fp-active{background-color:#767676}.svelte-fp-slide-name{background:rgba(78,85,91,.82);border:1px #4e555b;border-radius:3px;justify-self:start;margin:2rem;order:0;padding:2px;position:absolute;text-align:center}@media only screen and (max-width:600px){.svelte-fp-indicator-list-item-btn{border-radius:.25rem;height:.5rem;width:.5rem}}</style>"],"names":[],"mappings":"AAqBO,6CAA8B,CAAC,YAAY,MAAM,CAAC,QAAQ,IAAI,CAAC,OAAO,IAAI,CAAC,QAAQ,CAAC,CAAC,iDAAkC,CAAC,WAAW,GAAG,CAAC,iBAAiB,WAAW,CAAC,OAAO,GAAG,CAAC,KAAK,CAAC,OAAO,CAAC,cAAc,KAAK,CAAC,OAAO,IAAI,CAAC,MAAM,CAAC,CAAC,MAAM,IAAI,CAAC,gCAAiB,CAAC,iBAAiB,OAAO,CAAC,oCAAqB,CAAC,WAAW,KAAK,EAAE,CAAC,EAAE,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,GAAG,CAAC,OAAO,CAAC,cAAc,GAAG,CAAC,aAAa,KAAK,CAAC,OAAO,IAAI,CAAC,MAAM,CAAC,CAAC,QAAQ,GAAG,CAAC,SAAS,QAAQ,CAAC,WAAW,MAAM,CAAC,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,WAAW,KAAK,CAAC,CAAC,iDAAkC,CAAC,cAAc,MAAM,CAAC,OAAO,KAAK,CAAC,MAAM,KAAK,CAAC,CAAC"}`
};
const Dot = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { activeSection = 0 } = $$props;
  let { index: index2 = 0 } = $$props;
  let { name = "" } = $$props;
  let { names = false } = $$props;
  if ($$props.activeSection === void 0 && $$bindings.activeSection && activeSection !== void 0)
    $$bindings.activeSection(activeSection);
  if ($$props.index === void 0 && $$bindings.index && index2 !== void 0)
    $$bindings.index(index2);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.names === void 0 && $$bindings.names && names !== void 0)
    $$bindings.names(names);
  $$result.css.add(css$4);
  return `<li class="${"svelte-fp-indicator-list-item svelte-1ol7yt2"}">${names ? `<p class="${"svelte-fp-slide-name svelte-1ol7yt2"}">${escape(name)}</p>` : ``}
    <button class="${"svelte-fp-indicator-list-item-btn " + escape(activeSection === index2 ? "svelte-fp-active" : "") + " svelte-1ol7yt2"}"></button>
</li>`;
});
var index_svelte_svelte_type_style_lang = ".svelte-fp-indicator.svelte-natbm0{align-items:center;bottom:0;display:flex;height:inherit;justify-content:center;overflow:hidden;position:absolute;right:0;top:0;width:auto;z-index:100}.svelte-fp-indicator-list.svelte-natbm0{list-style-type:none;margin:1rem;padding:1rem}@media only screen and (max-width:600px){.svelte-fp-indicator.svelte-natbm0{width:2rem}.svelte-fp-indicator-list.svelte-natbm0{margin:.3rem;padding:.3rem}}";
const css$3 = {
  code: ".svelte-fp-indicator.svelte-natbm0{align-items:center;bottom:0;display:flex;height:inherit;justify-content:center;overflow:hidden;position:absolute;right:0;top:0;width:auto;z-index:100}.svelte-fp-indicator-list.svelte-natbm0{list-style-type:none;margin:1rem;padding:1rem}@media only screen and (max-width:600px){.svelte-fp-indicator.svelte-natbm0{width:2rem}.svelte-fp-indicator-list.svelte-natbm0{margin:.3rem;padding:.3rem}}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script>\\n    import Dot from './Dot.svelte';\\n    export let sections = []\\n    export let activeSection = 0;\\n\\n<\/script>\\n\\n<div class=\\"svelte-fp-indicator\\">\\n    <ul class=\\"svelte-fp-indicator-list\\">\\n        {#each sections as page,index}\\n            <Dot bind:activeSection {index} name={page}/>\\n        {/each}\\n    </ul>\\n</div>\\n\\n<style>.svelte-fp-indicator{align-items:center;bottom:0;display:flex;height:inherit;justify-content:center;overflow:hidden;position:absolute;right:0;top:0;width:auto;z-index:100}.svelte-fp-indicator-list{list-style-type:none;margin:1rem;padding:1rem}@media only screen and (max-width:600px){.svelte-fp-indicator{width:2rem}.svelte-fp-indicator-list{margin:.3rem;padding:.3rem}}</style>"],"names":[],"mappings":"AAeO,kCAAoB,CAAC,YAAY,MAAM,CAAC,OAAO,CAAC,CAAC,QAAQ,IAAI,CAAC,OAAO,OAAO,CAAC,gBAAgB,MAAM,CAAC,SAAS,MAAM,CAAC,SAAS,QAAQ,CAAC,MAAM,CAAC,CAAC,IAAI,CAAC,CAAC,MAAM,IAAI,CAAC,QAAQ,GAAG,CAAC,uCAAyB,CAAC,gBAAgB,IAAI,CAAC,OAAO,IAAI,CAAC,QAAQ,IAAI,CAAC,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,WAAW,KAAK,CAAC,CAAC,kCAAoB,CAAC,MAAM,IAAI,CAAC,uCAAyB,CAAC,OAAO,KAAK,CAAC,QAAQ,KAAK,CAAC,CAAC"}`
};
const Indicator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { sections = [] } = $$props;
  let { activeSection = 0 } = $$props;
  if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0)
    $$bindings.sections(sections);
  if ($$props.activeSection === void 0 && $$bindings.activeSection && activeSection !== void 0)
    $$bindings.activeSection(activeSection);
  $$result.css.add(css$3);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div class="${"svelte-fp-indicator svelte-natbm0"}"><ul class="${"svelte-fp-indicator-list svelte-natbm0"}">${each(sections, (page, index2) => `${validate_component(Dot, "Dot").$$render($$result, { index: index2, name: page, activeSection }, {
      activeSection: ($$value) => {
        activeSection = $$value;
        $$settled = false;
      }
    }, {})}`)}</ul>
</div>`;
  } while (!$$settled);
  return $$rendered;
});
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
var Fullpage_svelte_svelte_type_style_lang = ".svelte-fp-wrapper.svelte-178utfb{bottom:0;height:100%;left:0;overflow:hidden;position:absolute;right:0;top:0;width:100%}.svelte-fp-container.svelte-178utfb{height:inherit;position:relative;width:inherit}.svelte-fp-disable-pull-refresh.svelte-178utfb{-ms-scroll-chaining:none;overscroll-behavior:contain}";
const css$2 = {
  code: ".svelte-fp-wrapper.svelte-178utfb{bottom:0;height:100%;left:0;overflow:hidden;position:absolute;right:0;top:0;width:100%}.svelte-fp-container.svelte-178utfb{height:inherit;position:relative;width:inherit}.svelte-fp-disable-pull-refresh.svelte-178utfb{-ms-scroll-chaining:none;overscroll-behavior:contain}",
  map: `{"version":3,"file":"Fullpage.svelte","sources":["Fullpage.svelte"],"sourcesContent":["<script>\\n    import Indicator from './Indicator/index.svelte';\\n    import {onMount, setContext} from \\"svelte\\";\\n    import {writable} from \\"svelte/store\\";\\n    //defining variable that will hold class value, that will be passed into this component's wrapper\\n    let defaultClasses = '';\\n\\n    //exporting classes, for passing classes into wrapper\\n    export {defaultClasses as class};\\n    export let style = '';\\n    //number that hold which section is active\\n    export let activeSection = 0;\\n    const activeSectionStore = writable(activeSection)\\n    let sectionCount = 0;\\n    // Optional array of strings containing section titles, also count of section is calculated by length of this array\\n    export let sectionTitles = false;\\n    let sections = [];\\n    // duration of animation and scroll cooldown in milliseconds\\n    export let transitionDuration = 500;\\n    // enables scrolling using arrows\\n    export let arrows = false;\\n    // enables scrolling using drag\\n    export let drag = false;\\n    /*\\n    Distance in px, if values from events emitted by user behavior exceed this thresholds, function for handling drag (by\\n    cursor) or touch will be triggered.\\n     */\\n    export let dragThreshold = 100;\\n    export let touchThreshold = 75;\\n    export let pullDownToRefresh = false;\\n\\n    // Placeholder for content of slot\\n    let fullpageContent;\\n\\n    // Auxiliary variables that make possible drag and scroll feature\\n    let dragStartPosition;\\n    let touchStartPosition;\\n\\n    //extending exported classes with wrapper class\\n    let classes = \`\${defaultClasses} svelte-fp-wrapper\`;\\n    let recentScroll = 0;\\n    //setting section visible\\n    let active = true;\\n\\n    /*\\n    Passing data about section visibility to all sections, activeSectionStore notifies all child FullpageSections about\\n    changed active section, so previously active section will hide and newly active section will appear. Function getId\\n    is for determination sectionId for FullpageSection\\n     */\\n    setContext('section', {\\n        activeSectionStore,\\n        getId: ()=>{\\n            sectionCount++;\\n            return sectionCount-1;\\n        }\\n    })\\n\\n    //function that handles scroll and sets scroll cooldown based on animation duration\\n    const handleScroll = (event) => {\\n        //getting direction of scroll, if negative, scroll up, if positive, scroll down\\n        let deltaY = event.deltaY;\\n        let timer = new Date().getTime();\\n        //if cooldown time is up, fullpage is scrollable again\\n        if (transitionDuration < timer-recentScroll) {\\n            recentScroll = timer;\\n            if (deltaY < 0) {\\n                scrollUp()\\n            } else if (deltaY > 0) {\\n                scrollDown()\\n            }\\n        }\\n    };\\n    // toggles visibility of active section\\n    const toggleActive = () => {\\n        active = !active;\\n    };\\n    // scroll up effect, only when it's possible\\n    const scrollUp = async () => {\\n        if ($activeSectionStore > 0){\\n            activeSection--;\\n        }\\n    };\\n    // scroll down effect, only when it's possible\\n    const scrollDown = async () => {\\n        if ($activeSectionStore < sectionCount-1){\\n            activeSection++;\\n        }\\n    };\\n    // handling arrow event\\n    const handleKey = (event) => {\\n        if (arrows) {\\n            switch (event.key) {\\n                case 'ArrowDown':\\n                    scrollDown();\\n                    break;\\n                case 'ArrowUp':\\n                    scrollUp();\\n                    break;\\n            }\\n        }\\n    };\\n    // memoize drag start Y coordinate, only if drag effect is enabled\\n    const handleDragStart = (event) => {\\n        if (drag) {\\n            dragStartPosition = event.screenY;\\n        }\\n    };\\n    // handles drag end event\\n    const handleDragEnd = (event) => {\\n        if (drag) {\\n            const dragEndPosition = event.screenY;\\n            // Trigger scroll event after thresholds are exceeded\\n            if (dragStartPosition - dragEndPosition > dragThreshold) {\\n                scrollDown();\\n            } else if (dragStartPosition - dragEndPosition < -dragThreshold) {\\n                scrollUp()\\n            }\\n        }\\n    };\\n    // memoize touch start Y coordinate\\n    const handleTouchStart = (event) => {\\n        touchStartPosition = event.touches[0].screenY;\\n    };\\n    // Compare touch start and end Y coordinates, if difference exceeds threshold, scroll function is triggered\\n    const handleTouchEnd = (event) => {\\n        // Timer is used for preventing scrolling multiple sections\\n        let timer = new Date().getTime();\\n        const touchEndPosition = event.touches[0].screenY;\\n        if (transitionDuration < timer-recentScroll) {\\n            if (touchStartPosition - touchEndPosition > touchThreshold) {\\n                scrollDown();\\n                recentScroll = timer;\\n            } else if (touchStartPosition - touchEndPosition < -touchThreshold) {\\n                scrollUp();\\n                recentScroll = timer;\\n            }\\n        }\\n    };\\n\\n\\n    /*\\n    Everytime activeSection updates, this store gets new value and then all sections that subscribe,\\n    this is because user may want to control sections programmatically\\n     */\\n    $: activeSectionStore.set(activeSection)\\n\\n    // If user has specified sectionTitles, then sections is overridden\\n    $: if (sectionTitles) sections = sectionTitles;\\n\\n    // If user hasn't specified sectionTitle, sections array will be generated with placeholder strings\\n    $: if (fullpageContent && !sectionTitles) {\\n        console.log(fullpageContent.children.length)\\n        for (let i = 0; sectionCount > i; i++) {\\n            sections = [\\n                ...sections,\\n                \`Section \${i+1}\`\\n            ];\\n        }\\n    }\\n<\/script>\\n\\n<svelte:window on:keydown={ (event)=>handleKey(event) }/> <!-- Necessity when listening to window events -->\\n<svelte:body class:svelte-fp-disable-pull-refresh={pullDownToRefresh}/> <!-- disables slideDownToRefresh feature -->\\n\\n\\n<div class={classes} style={style} on:wheel={ (event)=>handleScroll(event) } on:touchstart={ (event)=>handleTouchStart(event) }\\n     on:touchmove={ (event)=>handleTouchEnd(event) } on:drag={ ()=>{return false} }\\n     on:mousedown={ (event)=>handleDragStart(event) } on:mouseup={ (event)=>handleDragEnd(event) }>\\n    <div class=\\"svelte-fp-container\\">\\n        <div bind:this={fullpageContent} class=\\"svelte-fp-container\\">\\n            <slot />\\n        </div>\\n        <Indicator bind:activeSection bind:sections/>\\n    </div>\\n</div>\\n\\n<style>.svelte-fp-wrapper{bottom:0;height:100%;left:0;overflow:hidden;position:absolute;right:0;top:0;width:100%}.svelte-fp-container{height:inherit;position:relative;width:inherit}.svelte-fp-disable-pull-refresh{-ms-scroll-chaining:none;overscroll-behavior:contain}</style>"],"names":[],"mappings":"AAgLO,iCAAkB,CAAC,OAAO,CAAC,CAAC,OAAO,IAAI,CAAC,KAAK,CAAC,CAAC,SAAS,MAAM,CAAC,SAAS,QAAQ,CAAC,MAAM,CAAC,CAAC,IAAI,CAAC,CAAC,MAAM,IAAI,CAAC,mCAAoB,CAAC,OAAO,OAAO,CAAC,SAAS,QAAQ,CAAC,MAAM,OAAO,CAAC,8CAA+B,CAAC,oBAAoB,IAAI,CAAC,oBAAoB,OAAO,CAAC"}`
};
const Fullpage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_activeSectionStore;
  let { class: defaultClasses = "" } = $$props;
  let { style = "" } = $$props;
  let { activeSection = 0 } = $$props;
  const activeSectionStore = writable(activeSection);
  $$unsubscribe_activeSectionStore = subscribe(activeSectionStore, (value) => value);
  let sectionCount = 0;
  let { sectionTitles = false } = $$props;
  let sections = [];
  let { transitionDuration = 500 } = $$props;
  let { arrows = false } = $$props;
  let { drag = false } = $$props;
  let { dragThreshold = 100 } = $$props;
  let { touchThreshold = 75 } = $$props;
  let { pullDownToRefresh = false } = $$props;
  let fullpageContent;
  let classes = `${defaultClasses} svelte-fp-wrapper`;
  setContext("section", {
    activeSectionStore,
    getId: () => {
      sectionCount++;
      return sectionCount - 1;
    }
  });
  if ($$props.class === void 0 && $$bindings.class && defaultClasses !== void 0)
    $$bindings.class(defaultClasses);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.activeSection === void 0 && $$bindings.activeSection && activeSection !== void 0)
    $$bindings.activeSection(activeSection);
  if ($$props.sectionTitles === void 0 && $$bindings.sectionTitles && sectionTitles !== void 0)
    $$bindings.sectionTitles(sectionTitles);
  if ($$props.transitionDuration === void 0 && $$bindings.transitionDuration && transitionDuration !== void 0)
    $$bindings.transitionDuration(transitionDuration);
  if ($$props.arrows === void 0 && $$bindings.arrows && arrows !== void 0)
    $$bindings.arrows(arrows);
  if ($$props.drag === void 0 && $$bindings.drag && drag !== void 0)
    $$bindings.drag(drag);
  if ($$props.dragThreshold === void 0 && $$bindings.dragThreshold && dragThreshold !== void 0)
    $$bindings.dragThreshold(dragThreshold);
  if ($$props.touchThreshold === void 0 && $$bindings.touchThreshold && touchThreshold !== void 0)
    $$bindings.touchThreshold(touchThreshold);
  if ($$props.pullDownToRefresh === void 0 && $$bindings.pullDownToRefresh && pullDownToRefresh !== void 0)
    $$bindings.pullDownToRefresh(pullDownToRefresh);
  $$result.css.add(css$2);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      activeSectionStore.set(activeSection);
    }
    {
      if (sectionTitles)
        sections = sectionTitles;
    }
    $$rendered = ` 
 


<div class="${escape(null_to_empty(classes)) + " svelte-178utfb"}"${add_attribute("style", style, 0)}><div class="${"svelte-fp-container svelte-178utfb"}"><div class="${"svelte-fp-container svelte-178utfb"}"${add_attribute("this", fullpageContent, 0)}>${slots.default ? slots.default({}) : ``}</div>
        ${validate_component(Indicator, "Indicator").$$render($$result, { activeSection, sections }, {
      activeSection: ($$value) => {
        activeSection = $$value;
        $$settled = false;
      },
      sections: ($$value) => {
        sections = $$value;
        $$settled = false;
      }
    }, {})}</div>
</div>`;
  } while (!$$settled);
  $$unsubscribe_activeSectionStore();
  return $$rendered;
});
var FullpageSection_svelte_svelte_type_style_lang = "section.svelte-1z03ymt{height:inherit;position:relative}.svelte-fp-flexbox-expand.svelte-1z03ymt{flex:1}.svelte-fp-container.svelte-1z03ymt{height:inherit;position:relative;width:inherit}.svelte-fp-flexbox-center.svelte-1z03ymt{align-items:center;display:flex;justify-content:center}.svelte-fp-unselectable.svelte-1z03ymt{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.svelte-fp-indicator-horizontal.svelte-1z03ymt{align-items:center;bottom:0;display:flex;height:5rem;justify-content:center;left:0;overflow:hidden;position:absolute;right:0;width:inherit}.svelte-fp-indicator-list-horizontal.svelte-1z03ymt{list-style-type:none;margin:1rem;padding:1rem}.svelte-fp-indicator-list-item.svelte-1z03ymt{display:inline-block;margin:1rem;padding:0}.svelte-fp-indicator-list-item-btn.svelte-1z03ymt{background-color:transparent;border:1px solid #767676;border-radius:.5rem;height:1rem;width:1rem}.svelte-fp-active.svelte-1z03ymt{background-color:#767676}";
const css$1 = {
  code: "section.svelte-1z03ymt{height:inherit;position:relative}.svelte-fp-flexbox-expand.svelte-1z03ymt{flex:1}.svelte-fp-container.svelte-1z03ymt{height:inherit;position:relative;width:inherit}.svelte-fp-flexbox-center.svelte-1z03ymt{align-items:center;display:flex;justify-content:center}.svelte-fp-unselectable.svelte-1z03ymt{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.svelte-fp-indicator-horizontal.svelte-1z03ymt{align-items:center;bottom:0;display:flex;height:5rem;justify-content:center;left:0;overflow:hidden;position:absolute;right:0;width:inherit}.svelte-fp-indicator-list-horizontal.svelte-1z03ymt{list-style-type:none;margin:1rem;padding:1rem}.svelte-fp-indicator-list-item.svelte-1z03ymt{display:inline-block;margin:1rem;padding:0}.svelte-fp-indicator-list-item-btn.svelte-1z03ymt{background-color:transparent;border:1px solid #767676;border-radius:.5rem;height:1rem;width:1rem}.svelte-fp-active.svelte-1z03ymt{background-color:#767676}",
  map: `{"version":3,"file":"FullpageSection.svelte","sources":["FullpageSection.svelte"],"sourcesContent":["<script>\\n    import {slide} from 'svelte/transition';\\n    import {getContext, onMount, setContext} from \\"svelte\\";\\n    import { writable } from \\"svelte/store\\";\\n\\n    let defaultClasses = '';\\n\\n    export { defaultClasses as class };\\n    export let style = '';\\n    let sectionId;\\n    const { getId, activeSectionStore} = getContext('section');\\n    export let slides = [];\\n    export let activeSlide = 0;\\n    const activeSlideStore = writable(activeSlide);\\n    export let center = false;\\n    export let arrows = false;\\n    export let select = false;\\n    export let transitionDuration = 500;\\n    export let dragThreshold = 100;\\n    export let touchThreshold = 75;\\n    export let transition = {\\n        duration: transitionDuration\\n    };\\n    sectionId = parseInt(sectionId);\\n    let visible;\\n\\n    let activeSlideIndicator = activeSlide;\\n    let dragStartPosition;\\n    let touchStartPosition;\\n    let recentSlide = 0;\\n    let slideCount = 0;\\n\\n    let classes = \`\${defaultClasses} svelte-fp-section svelte-fp-flexbox-center\`;\\n\\n    if (!select) {\\n        classes = \`\${classes} svelte-fp-unselectable\`\\n    }\\n\\n    // Passing data about slide visibility to all slides, same principle as setContext('section',{...}) in Fullpage.svelte\\n    setContext('slide', {\\n        activeSlideStore,\\n        getId: ()=>{\\n            slideCount++;\\n            return slideCount-1;\\n        }\\n    })\\n\\n    const makePositive = (num) => {\\n        let negative = false;\\n        if (num < 0) {\\n            negative = true;\\n            num = -num;\\n        }\\n        return {num, negative};\\n    };\\n\\n    const handleSelect = () => {\\n        if (!select) {\\n            return false;\\n        }\\n    };\\n\\n    const slideRight = () => {\\n        const active = makePositive($activeSlideStore);\\n        if (active.num < slides.length-1){\\n            activeSlideIndicator = active.num+1;\\n            activeSlideStore.set(-(activeSlideIndicator));\\n        } else {\\n            activeSlideStore.set(0)\\n            activeSlideIndicator = $activeSlideStore;\\n        }\\n    };\\n\\n    const slideLeft = () => {\\n        const active = makePositive($activeSlideStore);\\n        if (active.num > 0) {\\n            activeSlideStore.set(active.num-1);\\n        } else {\\n            activeSlideStore.set(slides.length-1);\\n        }\\n        activeSlideIndicator = $activeSlideStore;\\n    };\\n\\n    const toSlide = (slideId) => {\\n        if (slideId > activeSlideIndicator) {\\n            while (slideId > activeSlideIndicator) {\\n                slideRight()\\n            }\\n        } else {\\n            while (slideId < activeSlideIndicator) {\\n                slideLeft()\\n            }\\n        }\\n    };\\n\\n    // handling arrow event\\n    const handleKey = (event) => {\\n        if (arrows) {\\n            switch (event.key) {\\n                case 'ArrowLeft':\\n                    slideLeft();\\n                    break;\\n                case 'ArrowRight':\\n                    slideRight();\\n                    break;\\n            }\\n        }\\n    };\\n\\n    // memoize drag start X coordinate\\n    const handleDragStart = (event) => {\\n        dragStartPosition = event.screenX;\\n    };\\n    // handles drag end event\\n    const handleDragEnd = (event) => {\\n        const dragEndPosition = event.screenX;\\n        // Trigger scroll event after thresholds are exceeded\\n        if (dragStartPosition - dragEndPosition > dragThreshold) {\\n            slideRight();\\n        } else if (dragStartPosition - dragEndPosition < -dragThreshold) {\\n            slideLeft()\\n        }\\n    };\\n\\n    // memoize touch start X coordinate\\n    const handleTouchStart = (event) => {\\n        touchStartPosition = event.touches[0].screenX;\\n    };\\n    // Compare touch start and end X coordinates, if difference exceeds threshold, scroll function is triggered\\n    const handleTouchEnd = (event) => {\\n        // Timer is used for preventing scrolling multiple slides\\n        let timer = new Date().getTime();\\n        const touchEndPosition = event.touches[0].screenX;\\n        if (transitionDuration < timer-recentSlide) {\\n            if (touchStartPosition - touchEndPosition > touchThreshold) {\\n                slideRight();\\n                recentSlide = timer;\\n            } else if (touchStartPosition - touchEndPosition < -touchThreshold) {\\n                slideLeft();\\n                recentSlide = timer;\\n            }\\n        }\\n    };\\n\\n    // Recompute visible: boolean everytime one of dependencies change\\n    $: visible = (sectionId === $activeSectionStore);\\n\\n    /*\\n    Everytime activeSlide updates, this store gets new value and then all slides that subscribe,\\n    this is because user may want to control slides programmatically\\n     */\\n    $: activeSlideStore.set(activeSlide)\\n\\n    // After DOM is ready ged sectionId\\n    onMount(()=>{\\n        sectionId = getId()\\n    })\\n    // Everytime section disappears, slide count resets, this prevents slides from getting wrong ID\\n    $: if (!visible) {\\n        slideCount = 0;\\n    }\\n<\/script>\\n\\n<svelte:window on:keydown={ (event)=>handleKey(event) }/>\\n\\n{#if visible}\\n    <section transition:slide={transition} class={classes} style={style} on:selectstart={handleSelect}\\n             on:mousedown={ (event)=>handleDragStart(event) } on:mouseup={ (event)=>handleDragEnd(event) }\\n            on:touchstart={ (event)=>handleTouchStart(event) } on:touchmove={ (event)=>handleTouchEnd(event) }>\\n        <div class=\\"svelte-fp-container svelte-fp-flexbox-expand\\" class:svelte-fp-flexbox-center={center}>\\n            <slot>\\n            </slot>\\n        </div>\\n        {#if slides[0]}\\n            <div class=\\"svelte-fp-indicator-horizontal\\">\\n                <ul class=\\"svelte-fp-indicator-list-horizontal\\">\\n                    {#each slides as page,index}\\n                        <li class=\\"svelte-fp-indicator-list-item\\">\\n                            <button class=\\"svelte-fp-indicator-list-item-btn {activeSlideIndicator === index ? 'svelte-fp-active':''}\\" on:click={ ()=>toSlide(index) }></button>\\n                        </li>\\n                    {/each}\\n                </ul>\\n            </div>\\n        {/if}\\n    </section>\\n{/if}\\n\\n<style>section{height:inherit;position:relative}.svelte-fp-flexbox-expand{flex:1}.svelte-fp-container{height:inherit;position:relative;width:inherit}.svelte-fp-flexbox-center{align-items:center;display:flex;justify-content:center}.svelte-fp-unselectable{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.svelte-fp-indicator-horizontal{align-items:center;bottom:0;display:flex;height:5rem;justify-content:center;left:0;overflow:hidden;position:absolute;right:0;width:inherit}.svelte-fp-indicator-list-horizontal{list-style-type:none;margin:1rem;padding:1rem}.svelte-fp-indicator-list-item{display:inline-block;margin:1rem;padding:0}.svelte-fp-indicator-list-item-btn{background-color:transparent;border:1px solid #767676;border-radius:.5rem;height:1rem;width:1rem}.svelte-fp-active{background-color:#767676}</style>"],"names":[],"mappings":"AA2LO,sBAAO,CAAC,OAAO,OAAO,CAAC,SAAS,QAAQ,CAAC,wCAAyB,CAAC,KAAK,CAAC,CAAC,mCAAoB,CAAC,OAAO,OAAO,CAAC,SAAS,QAAQ,CAAC,MAAM,OAAO,CAAC,wCAAyB,CAAC,YAAY,MAAM,CAAC,QAAQ,IAAI,CAAC,gBAAgB,MAAM,CAAC,sCAAuB,CAAC,oBAAoB,IAAI,CAAC,iBAAiB,IAAI,CAAC,gBAAgB,IAAI,CAAC,YAAY,IAAI,CAAC,8CAA+B,CAAC,YAAY,MAAM,CAAC,OAAO,CAAC,CAAC,QAAQ,IAAI,CAAC,OAAO,IAAI,CAAC,gBAAgB,MAAM,CAAC,KAAK,CAAC,CAAC,SAAS,MAAM,CAAC,SAAS,QAAQ,CAAC,MAAM,CAAC,CAAC,MAAM,OAAO,CAAC,mDAAoC,CAAC,gBAAgB,IAAI,CAAC,OAAO,IAAI,CAAC,QAAQ,IAAI,CAAC,6CAA8B,CAAC,QAAQ,YAAY,CAAC,OAAO,IAAI,CAAC,QAAQ,CAAC,CAAC,iDAAkC,CAAC,iBAAiB,WAAW,CAAC,OAAO,GAAG,CAAC,KAAK,CAAC,OAAO,CAAC,cAAc,KAAK,CAAC,OAAO,IAAI,CAAC,MAAM,IAAI,CAAC,gCAAiB,CAAC,iBAAiB,OAAO,CAAC"}`
};
const FullpageSection = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $activeSectionStore, $$unsubscribe_activeSectionStore;
  let $$unsubscribe_activeSlideStore;
  let { class: defaultClasses = "" } = $$props;
  let { style = "" } = $$props;
  let sectionId;
  const { getId, activeSectionStore } = getContext("section");
  $$unsubscribe_activeSectionStore = subscribe(activeSectionStore, (value) => $activeSectionStore = value);
  let { slides = [] } = $$props;
  let { activeSlide = 0 } = $$props;
  const activeSlideStore = writable(activeSlide);
  $$unsubscribe_activeSlideStore = subscribe(activeSlideStore, (value) => value);
  let { center = false } = $$props;
  let { arrows = false } = $$props;
  let { select = false } = $$props;
  let { transitionDuration = 500 } = $$props;
  let { dragThreshold = 100 } = $$props;
  let { touchThreshold = 75 } = $$props;
  let { transition = { duration: transitionDuration } } = $$props;
  sectionId = parseInt(sectionId);
  let visible;
  let activeSlideIndicator = activeSlide;
  let slideCount = 0;
  let classes = `${defaultClasses} svelte-fp-section svelte-fp-flexbox-center`;
  if (!select) {
    classes = `${classes} svelte-fp-unselectable`;
  }
  setContext("slide", {
    activeSlideStore,
    getId: () => {
      slideCount++;
      return slideCount - 1;
    }
  });
  if ($$props.class === void 0 && $$bindings.class && defaultClasses !== void 0)
    $$bindings.class(defaultClasses);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.slides === void 0 && $$bindings.slides && slides !== void 0)
    $$bindings.slides(slides);
  if ($$props.activeSlide === void 0 && $$bindings.activeSlide && activeSlide !== void 0)
    $$bindings.activeSlide(activeSlide);
  if ($$props.center === void 0 && $$bindings.center && center !== void 0)
    $$bindings.center(center);
  if ($$props.arrows === void 0 && $$bindings.arrows && arrows !== void 0)
    $$bindings.arrows(arrows);
  if ($$props.select === void 0 && $$bindings.select && select !== void 0)
    $$bindings.select(select);
  if ($$props.transitionDuration === void 0 && $$bindings.transitionDuration && transitionDuration !== void 0)
    $$bindings.transitionDuration(transitionDuration);
  if ($$props.dragThreshold === void 0 && $$bindings.dragThreshold && dragThreshold !== void 0)
    $$bindings.dragThreshold(dragThreshold);
  if ($$props.touchThreshold === void 0 && $$bindings.touchThreshold && touchThreshold !== void 0)
    $$bindings.touchThreshold(touchThreshold);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  $$result.css.add(css$1);
  visible = sectionId === $activeSectionStore;
  {
    activeSlideStore.set(activeSlide);
  }
  {
    if (!visible) {
      slideCount = 0;
    }
  }
  $$unsubscribe_activeSectionStore();
  $$unsubscribe_activeSlideStore();
  return `

${visible ? `<section class="${escape(null_to_empty(classes)) + " svelte-1z03ymt"}"${add_attribute("style", style, 0)}><div class="${[
    "svelte-fp-container svelte-fp-flexbox-expand svelte-1z03ymt",
    center ? "svelte-fp-flexbox-center" : ""
  ].join(" ").trim()}">${slots.default ? slots.default({}) : `
            `}</div>
        ${slides[0] ? `<div class="${"svelte-fp-indicator-horizontal svelte-1z03ymt"}"><ul class="${"svelte-fp-indicator-list-horizontal svelte-1z03ymt"}">${each(slides, (page, index2) => `<li class="${"svelte-fp-indicator-list-item svelte-1z03ymt"}"><button class="${"svelte-fp-indicator-list-item-btn " + escape(activeSlideIndicator === index2 ? "svelte-fp-active" : "") + " svelte-1z03ymt"}"></button>
                        </li>`)}</ul></div>` : ``}</section>` : ``}`;
});
var FullpageSlide_svelte_svelte_type_style_lang = ".svelte-fp-content.svelte-1o3vu8r{bottom:0;height:inherit;left:0;position:absolute;right:0;top:0;width:inherit}.svelte-fp-flexbox-center.svelte-1o3vu8r{align-items:center;display:flex;justify-content:center}";
const css = {
  code: ".svelte-fp-content.svelte-1o3vu8r{bottom:0;height:inherit;left:0;position:absolute;right:0;top:0;width:inherit}.svelte-fp-flexbox-center.svelte-1o3vu8r{align-items:center;display:flex;justify-content:center}",
  map: `{"version":3,"file":"FullpageSlide.svelte","sources":["FullpageSlide.svelte"],"sourcesContent":["<script>\\n    import {fly} from 'svelte/transition'\\n    import {getContext, onMount} from \\"svelte\\";\\n\\n    let defaultClasses = '';\\n    export { defaultClasses as class };\\n    export let style = '';\\n    let slideId = 0;\\n    let activeSlide = 0;\\n    const { activeSlideStore, getId } = getContext('slide')\\n    export let center = false;\\n    export let transitionIn = {\\n        duration: 500,\\n        x: -2000\\n    };\\n    export let transitionOut = {\\n        duration: 500,\\n        x: 2000\\n    };\\n\\n    const makePositive = (num) => {\\n        let negative = false;\\n        if (num < 0) {\\n            negative = true;\\n            num = -num;\\n        }\\n        return {num, negative};\\n    };\\n\\n    const correctAnimation = (active) => {\\n        const state = makePositive(active);\\n        // Sets animation direction based on scroll/drag/arrow direction\\n        if (state.negative) {\\n            transitionIn.x = 2000;\\n            transitionOut.x = -2000;\\n        } else {\\n            transitionIn.x = -2000;\\n            transitionOut.x = 2000;\\n        }\\n        activeSlide = state.num;\\n    }\\n\\n    // When activeSlide value changes, activeSlideStore value updates\\n    $: activeSlideStore.set(activeSlide)\\n\\n    // When activeSlideStore value changes, recompute transitions and change activeSlide\\n    $: correctAnimation($activeSlideStore)\\n\\n    // After DOM is ready ged slideId\\n    onMount(()=>{\\n        slideId = getId()\\n    })\\n<\/script>\\n\\n{#if slideId === activeSlide}\\n    <div class={\`\${defaultClasses} svelte-fp-content\`} style={style} in:fly={transitionIn} out:fly={transitionOut} class:svelte-fp-flexbox-center={center}>\\n        <slot>\\n        </slot>\\n    </div>\\n{/if}\\n\\n<style>.svelte-fp-content{bottom:0;height:inherit;left:0;position:absolute;right:0;top:0;width:inherit}.svelte-fp-flexbox-center{align-items:center;display:flex;justify-content:center}</style>"],"names":[],"mappings":"AA6DO,iCAAkB,CAAC,OAAO,CAAC,CAAC,OAAO,OAAO,CAAC,KAAK,CAAC,CAAC,SAAS,QAAQ,CAAC,MAAM,CAAC,CAAC,IAAI,CAAC,CAAC,MAAM,OAAO,CAAC,wCAAyB,CAAC,YAAY,MAAM,CAAC,QAAQ,IAAI,CAAC,gBAAgB,MAAM,CAAC"}`
};
const FullpageSlide = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $activeSlideStore, $$unsubscribe_activeSlideStore;
  let { class: defaultClasses = "" } = $$props;
  let { style = "" } = $$props;
  let slideId = 0;
  let activeSlide = 0;
  const { activeSlideStore, getId } = getContext("slide");
  $$unsubscribe_activeSlideStore = subscribe(activeSlideStore, (value) => $activeSlideStore = value);
  let { center = false } = $$props;
  let { transitionIn = { duration: 500, x: -2e3 } } = $$props;
  let { transitionOut = { duration: 500, x: 2e3 } } = $$props;
  const makePositive = (num) => {
    let negative = false;
    if (num < 0) {
      negative = true;
      num = -num;
    }
    return { num, negative };
  };
  const correctAnimation = (active) => {
    const state = makePositive(active);
    if (state.negative) {
      transitionIn.x = 2e3;
      transitionOut.x = -2e3;
    } else {
      transitionIn.x = -2e3;
      transitionOut.x = 2e3;
    }
    activeSlide = state.num;
  };
  if ($$props.class === void 0 && $$bindings.class && defaultClasses !== void 0)
    $$bindings.class(defaultClasses);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.center === void 0 && $$bindings.center && center !== void 0)
    $$bindings.center(center);
  if ($$props.transitionIn === void 0 && $$bindings.transitionIn && transitionIn !== void 0)
    $$bindings.transitionIn(transitionIn);
  if ($$props.transitionOut === void 0 && $$bindings.transitionOut && transitionOut !== void 0)
    $$bindings.transitionOut(transitionOut);
  $$result.css.add(css);
  {
    activeSlideStore.set(activeSlide);
  }
  {
    correctAnimation($activeSlideStore);
  }
  $$unsubscribe_activeSlideStore();
  return `${slideId === activeSlide ? `<div class="${[
    escape(null_to_empty(`${defaultClasses} svelte-fp-content`)) + " svelte-1o3vu8r",
    center ? "svelte-fp-flexbox-center" : ""
  ].join(" ").trim()}"${add_attribute("style", style, 0)}>${slots.default ? slots.default({}) : `
        `}</div>` : ``}`;
});
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const sections = ["Home", "History", "Present", "Next"];
  let activeSection = 0;
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(Fullpage, "Fullpage").$$render($$result, {
      arrows: true,
      drag: true,
      sectionTitles: sections,
      activeSection
    }, {
      activeSection: ($$value) => {
        activeSection = $$value;
        $$settled = false;
      }
    }, {
      default: () => `
  ${validate_component(FullpageSection, "FullpageSection").$$render($$result, { slides: [], transitionDuration: 800 }, {}, {
        default: () => `<section style="${"background: url('/plutusbg.png'); background-position: center; background-repeat: no-repeat; background-size: cover;"}" class="${"text-gray-300 min-h-screen bg-supadark-dark"}"><div class="${"flex flex-col items-center px-5 py-16 mx-auto md:flex-row lg:px-28 "}"><div class="${"flex flex-col mt-24 items-start w-full pt-0 mb-16 text-left lg:flex-grow md:w-1/2 xl:mr-20 md:pr-24 md:mb-0 "}"><h1 class="${"mb-8 font-commorant uppercase text-2xl font-bold text-left text-white lg:text-8xl"}">Funding for Society&#39;s Superheroes
          </h1>

          <div class="${"items-start text-lg"}">${validate_component(Sbutton, "Sbutton").$$render($$result, {}, {}, { default: () => `Help a Superhero` })}</div></div>
        <div class="${"w-full lg:w-5/6 lg:max-w-xl md:w-1/2 static"}"></div></div></section>`
      })}
  ${validate_component(FullpageSection, "FullpageSection").$$render($$result, { slides: [], transitionDuration: 800 }, {}, {
        default: () => `${validate_component(FullpageSlide, "FullpageSlide").$$render($$result, {}, {}, {
          default: () => `${validate_component(Section1, "Section1").$$render($$result, {}, {}, {})}`
        })}`
      })}
  ${validate_component(FullpageSection, "FullpageSection").$$render($$result, { slides: [], transitionDuration: 800 }, {}, {
        default: () => `${validate_component(FullpageSlide, "FullpageSlide").$$render($$result, {}, {}, {
          default: () => `${validate_component(Section2, "Section2").$$render($$result, {}, {}, {})}`
        })}`
      })}

  ${validate_component(FullpageSection, "FullpageSection").$$render($$result, { slides: [], transitionDuration: 800 }, {}, {
        default: () => `${validate_component(Section4, "Section4").$$render($$result, {}, {}, {})}`
      })}
  

  `
    })}`;
  } while (!$$settled);
  return $$rendered;
});
var index$2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
const Governance = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="${"text-white font-bold text-4xl h-screen flex justify-center items-center"}">Coming Soon
</div>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Governance
});
const Subsection = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="${"w-full h-44 bg-supagreen-dark grid text-supadark grid-cols-12"}"><div class="${"col-span-4 text-center my-auto"}"><p class="${"text-2xl font-bold"}">Funded Projects</p>
        <p>0</p></div>
    <div class="${"col-span-4 text-center my-auto"}"><p class="${"text-2xl font-bold"}">Total Funding Value</p>
        <p>0</p></div>
    <div class="${"col-span-4 text-center my-auto"}"><p class="${"text-2xl font-bold"}">Treasury Value</p>
        <p>0</p></div></div>`;
});
var subsection = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Subsection
});
const Protocol = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section><div class="${"container px-6 py-16 mx-auto text-center"}"><div class="${"max-w-lg mx-auto"}"><h1 class="${"text-3xl font-bold text-white dark:text-white md:text-4xl"}">Grow the Ecosystem</h1>
                <p class="${"mt-6 text-gray-400 dark:text-gray-300"}">Join together hand-to-hand to build a better system for the people. Grow the superhero community to help others in need.</p>
                <div class="${"max-w-sm mt-4 mx-auto"}">${validate_component(Sbutton, "Sbutton").$$render($$result, {}, {}, { default: () => `Get started` })}</div>
                <p class="${"mt-3 text-sm text-gray-400 "}">Open source protocol</p></div>
    
            </div></section>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Protocol
});
const Section3 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"section min-h-screen"}"><h1 data-aos="${"fade-up"}" class="${"text-gray-50 text-4xl font-athelas max-w-2xl text-center font-bold mx-auto"}">Supported By the Best Technologies</h1>
  <h1 data-aos="${"fade-up"}" class="${"text-gray-400 text-lg font-athelas max-w-2xl text-center font-thin mx-auto"}">Over $5 Billion+ TVL</h1>
  <div data-aos="${"fade-up"}" class="${"container grid grid-cols-3 max-w-4xl pt-16 gap-12 mx-auto"}"><div class="${"w-full rounded my-auto"}"><img src="${"https://moralis.io/wp-content/uploads/2021/01/logo_footer.svg"}" alt="${"Moralis"}"></div>
    <div class="${"w-full rounded my-auto"}"><img src="${"https://assets.website-files.com/6059b554e81c705f9dd2dd32/6100222344a9783fbdf5a4f2_Group%203004.svg"}" alt="${"Avax"}"></div>
    <div class="${"w-full rounded my-auto"}"><img src="${"https://yieldyak.com/assets/logo.png"}" alt="${"YieldYak"}"></div>
    <div class="${"w-full rounded my-auto"}"><img src="${"https://benqi.fi/images/logo.svg"}" alt="${"Benqi"}"></div>
    <div class="${"w-full rounded my-auto"}"><img src="${"https://alphafinancelab.gitbook.io/~/files/v0/b/gitbook-28427.appspot.com/o/assets%2F-MN7u-AvCDEUMu4IVTmX%2F-MX0n2IwFz9oql1YUE-a%2F-MX0yR2c9aQ8UzywHuIL%2FAlphaLogo_Black_1024x512.png?alt=media&token=8cbada46-9939-40fc-ac9f-3787d4e45e89"}" alt="${"Alpha Finance"}"></div>
    <div class="${"w-full rounded my-auto"}"><img src="${"https://pangolin.exchange/logo.svg"}" alt="${"pangolin"}"></div></div></section>`;
});
var section3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Section3
});
export { init, render };
