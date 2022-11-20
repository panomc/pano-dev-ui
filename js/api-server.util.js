import { API_URL } from "$lib/variables";

async function send({ method, path, data, token, headers, parse = true }) {
  const opts = { method, headers: {} };

  const isBodyFormData = data instanceof FormData;

  if (data) {
    if (!isBodyFormData) {
      opts.headers["Content-Type"] = "application/json";
    }

    opts.body = data;
  }

  if (headers) {
    opts.headers = { ...headers };
  }

  if (token) {
    opts.headers["Authorization"] = `Bearer ${token}`;
  }

  const request = fetch(`${API_URL}/${path.replace("/api/", "")}`, opts);

  if (parse === false) {
    return request;
  }

  return request
    .then((r) => r.text())
    .then((json) => {
      try {
        return JSON.parse(json);
      } catch (err) {
        return json;
      }
    });
}

export function GET({ path, token, parse = true }) {
  return send({ method: "GET", path, token, parse });
}

export function DELETE(path, token) {
  return send({ method: "DELETE", path, token });
}

export function POST(path, data, token) {
  return send({ method: "POST", path, data, token });
}

export function PUT({ path, data, token, headers }) {
  return send({ method: "PUT", path, data, token, headers });
}
