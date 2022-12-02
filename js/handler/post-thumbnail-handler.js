import * as api from "$lib/api-server.util.js";

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ url }) {
  return await api.GET({ path: url.pathname, parse: false });
}
