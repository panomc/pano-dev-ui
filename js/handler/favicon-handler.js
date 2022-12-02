import * as api from "$lib/api-server.util.js";
import { returnError } from "../api.proxy.js";

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ url, fetch }) {
  let body = await api.GET({ path: url.pathname, parse: false }).catch(returnError);

  if (body.status === 404 || body.error === "NETWORK_ERROR") {
    return fetch("/assets/img/minecraft-icon.png");
  }

  return body;
}
