import * as api from "$lib/api-server.util";
import { CSRF_HEADER } from "$lib/variables";
import { NETWORK_ERROR } from "$lib/api.util.js";

export const networkErrorBody = { result: "error", error: NETWORK_ERROR };

export const returnError = () => {
  return new Response(JSON.stringify(networkErrorBody));
};

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function handle(
  {
    request: { method, headers },
    request,
    locals: { jwt, CSRFToken },
    url: { pathname, search },
  },
  data = null
) {
  let response;

  if (CSRFToken && headers.get(CSRF_HEADER) !== CSRFToken) {
    return returnError();
  }

  if (data === null && (method === "POST" || method === "PUT")) {
    if (
      headers.get("content-type") &&
      headers.get("content-type").includes("multipart/form-data")
    ) {
      data = await request.formData();
    } else {
      data = await request.text();
    }
  }

  if (method === "GET") {
    response = await api
      .GET({ path: pathname + search, token: jwt })
      .catch(returnError);
  }

  if (method === "DELETE") {
    response = await api.DELETE(pathname + search, jwt).catch(returnError);
  }

  if (method === "POST") {
    response = await api.POST(pathname + search, data, jwt).catch(returnError);
  }

  if (method === "PUT") {
    response = await api
      .PUT({ path: pathname + search, data, token: jwt })
      .catch(returnError);
  }

  if (response instanceof Response) {
    return response;
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

export function throwError(errorCode) {
  const body = {
    result: "error",
    error: errorCode,
  };

  return new Response(JSON.stringify(body));
}
