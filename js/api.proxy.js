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
  locals: { jwt, CSRFToken },
  url: { pathname, search },
}) {
  let response;

  if (CSRFToken && headers.get(CSRF_HEADER) !== CSRFToken) {
    return returnError();
  }

  if (method === "GET") {
    response = await api.get(pathname + search, jwt).catch(returnError);
  }

  if (method === "DELETE") {
    response = await api.del(pathname + search, jwt).catch(returnError);
  }

  if (method === "POST") {
    response = await api
      .post(pathname + search, await request.text(), jwt)
      .catch(returnError);
  }

  if (method === "PUT") {
    response = await api
      .put(pathname + search, await request.text(), jwt)
      .catch(returnError);
  }

  return { body: response };
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET(request) {
  return handle(request);
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE(request) {
  return handle(request);
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST(request) {
  return handle(request);
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PUT(request) {
  return handle(request);
}
