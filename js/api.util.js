import { CSRF_HEADER } from "$lib/variables";
import { get } from "svelte/store";
import { page } from "$app/stores";

export const NETWORK_ERROR = "NETWORK_ERROR";

const ApiUtil = {
  get({ path, request, CSRFToken, token }) {
    return this.customRequest({ path, request, CSRFToken, token });
  },

  post({ path, request, body, headers, CSRFToken, token }) {
    return this.customRequest({
      path,
      data: {
        method: "POST",
        credentials: "include",
        body,
        headers,
      },
      request,
      CSRFToken,
      token,
    });
  },

  put({ path, request, body, headers, CSRFToken, token }) {
    return this.customRequest({
      path,
      data: {
        method: "PUT",
        credentials: "include",
        body,
        headers,
      },
      request,
      CSRFToken,
      token,
    });
  },

  delete({ path, request, headers, CSRFToken, token }) {
    return this.customRequest({
      path,
      data: {
        method: "DELETE",
        headers,
      },
      request,
      CSRFToken,
      token,
    });
  },

  async customRequest({ path, data = {}, request, CSRFToken, token }) {
    if (!CSRFToken) {
      let session;

      if (request) {
        const parentData = await request.parent();

        const { session: parentSession } = parentData;

        session = parentSession;
      } else {
        const { session: pageSession } = get(page).data;

        session = pageSession;
      }

      CSRFToken = session && session.CSRFToken;
    }

    const CSRFHeader = {};

    if (CSRFToken) CSRFHeader[CSRF_HEADER] = CSRFToken;

    if (!(data.body instanceof FormData)) {
      data.body = JSON.stringify(data.body);

      data.headers = {
        "Content-Type": "application/json",
        ...data.headers,
      };
    }

    const options = {
      ...data,
      headers: CSRFToken ? { ...data.headers, ...CSRFHeader } : data.headers,
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    // path = `${API_URL}/${path.replace("/api/", "")}`;

    const fetchRequest =
      request && request.fetch
        ? request.fetch(path, options)
        : fetch(path, options);

    return fetchRequest
      .then((r) => r.text())
      .then((json) => {
        try {
          return JSON.parse(json);
        } catch (err) {
          return json;
        }
      });
  },
};

export default ApiUtil;
