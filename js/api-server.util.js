import { API_URL } from "$lib/variables";

async function send({ method, path, data, token }) {
  const opts = { method, headers: {} };

  if (data) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = data;
  }

  if (token) {
    opts.headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}/${path.replace("/api/", "")}`, opts)
    .then((r) => r.text())
    .then((json) => {
      try {
        return JSON.parse(json);
      } catch (err) {
        return json;
      }
    });
}

export function GET(path, token) {
  return send({ method: "GET", path, token });
}

export function DELETE(path, token) {
  return send({ method: "DELETE", path, token });
}

export function POST(path, data, token) {
  return send({ method: "POST", path, data, token });
}

export function PUT(path, data, token) {
  return send({ method: "PUT", path, data, token });
}
