import * as api from "$lib/api.util.server";
import { CSRF_HEADER } from "$lib/variables";
import { NETWORK_ERROR } from "$lib/api.util.js";

const returnError = () => {
  return { result: "error", error: NETWORK_ERROR };
};

/** @type {import('@sveltejs/kit').RequestHandler} */
async function handle({
  request: { method, headers },
  request,
  params: { path },
  locals: { jwt, CSRFToken },
}) {
  let response;

  if (
    headers.get(CSRF_HEADER) &&
    CSRFToken &&
    headers.get(CSRF_HEADER) !== CSRFToken
  ) {
    return returnError();
  }

  if (method === "GET") {
    response = await api.get(path, jwt).catch(returnError);
  }

  if (method === "DELETE") {
    response = await api.del(path, jwt).catch(returnError);
  }

  if (method === "POST") {
    response = await api
      .post(path, await request.text(), jwt)
      .catch(returnError);
  }

  if (method === "PUT") {
    response = await api
      .put(path, await request.text(), jwt)
      .catch(returnError);
  }

  return { body: response };
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get(request) {
  return handle(request);
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function del(request) {
  return handle(request);
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post(request) {
  return handle(request);
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function put(request) {
  return handle(request);
}
