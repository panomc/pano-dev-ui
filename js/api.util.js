import { API_URL, CSRF_HEADER } from "$lib/variables";
import { get } from "svelte/store";
import { page } from "$app/stores";
import { browser } from "$app/environment";

export const NETWORK_ERROR = "NETWORK_ERROR";

export const networkErrorBody = { result: "error", error: NETWORK_ERROR };

const ApiUtil = {
  get({ path, request, csrfToken, token }) {
    return this.customRequest({ path, request, csrfToken, token });
  },

  post({ path, request, body, headers, csrfToken, token }) {
    return this.customRequest({
      path,
      data: {
        method: "POST",
        credentials: "include",
        body,
        headers,
      },
      request,
      csrfToken,
      token,
    });
  },

  put({ path, request, body, headers, csrfToken, token }) {
    return this.customRequest({
      path,
      data: {
        method: "PUT",
        credentials: "include",
        body,
        headers,
      },
      request,
      csrfToken,
      token,
    });
  },

  delete({ path, request, headers, csrfToken, token }) {
    return this.customRequest({
      path,
      data: {
        method: "DELETE",
        headers,
      },
      request,
      csrfToken,
      token,
    });
  },

  async customRequest({ path, data = {}, request, csrfToken, token }) {
    if (!csrfToken) {
      let session;

      if (request) {
        const parentData = await request.parent();

        const { session: parentSession } = parentData;

        session = parentSession;
      } else if (browser && get(page).data) {
        const { session: pageSession } = get(page).data;

        session = pageSession;
      }

      csrfToken = session && session.csrfToken;
    }

    const CSRFHeader = {};

    if (csrfToken) CSRFHeader[CSRF_HEADER] = csrfToken;

    if (!(data.body instanceof FormData)) {
      data.body = JSON.stringify(data.body);

      data.headers = {
        "Content-Type": "application/json",
        ...data.headers,
      };
    }

    const options = {
      ...data,
      headers: csrfToken ? { ...data.headers, ...CSRFHeader } : data.headers,
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    } else {
      const isCredentialsSupported = "credentials" in Request.prototype;

      if (isCredentialsSupported) {
        options["credentials"] = "include";
      }
    }

    path = `${API_URL}/${path.replace("/api/", "")}`;

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
