import { CSRF_HEADER } from "$lib/variables";

export const NETWORK_ERROR = "NETWORK_ERROR";

const ApiUtil = {
  get({ path, request, CSRFToken }) {
    return this.customRequest({ path, request, CSRFToken });
  },

  post({ path, request, body, CSRFToken }) {
    return this.customRequest({
      path,
      data: {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(body || {}),
        headers: {
          "Content-Type": "application/json",
        },
      },
      request,
      CSRFToken,
    });
  },

  put({ path, request, body, CSRFToken }) {
    return this.customRequest({
      path,
      data: {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(body || {}),
        headers: {
          "Content-Type": "application/json",
        },
      },
      request,
      CSRFToken,
    });
  },

  delete({ path, request, CSRFToken }) {
    return this.customRequest({
      path,
      data: {
        method: "DELETE",
      },
      request,
      CSRFToken,
    });
  },

  customRequest({
    path,
    data = {},
    request,
    CSRFToken = request && request.locals.CSRFToken,
  }) {
    const CSRFHeader = {};

    if (CSRFToken) CSRFHeader[CSRF_HEADER] = CSRFToken;

    const input = {
      ...data,
      headers: CSRFToken ? { ...data.headers, ...CSRFHeader } : data.headers,
    };

    const url = request ? `http://127.0.0.1:${request.url.port}` + path : path;
    const fetchRequest = (request && request.fetch)
      ? request.fetch(url, input)
      : fetch(url, input);

    return fetchRequest
      .then((r) => r.text())
      .then((json) => {
        try {
          return JSON.parse(json);
        } catch (err) {
          return json;
        }
      })
  },
};

export default ApiUtil;
