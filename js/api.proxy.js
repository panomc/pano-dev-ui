import * as api from "$lib/api-server.util";
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
    response = await api.GET(pathname + search, jwt).catch(returnError);
  }

  if (method === "DELETE") {
    response = await api.DELETE(pathname + search, jwt).catch(returnError);
  }

  if (method === "POST") {
    response = await api
      .POST(pathname + search, await request.text(), jwt)
      .catch(returnError);
  }

  if (method === "PUT") {
    response = await api
      .PUT(pathname + search, await request.text(), jwt)
      .catch(returnError);
  }

  return new Response(JSON.stringify(response));
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
