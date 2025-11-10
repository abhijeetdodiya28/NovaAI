// api.js
const API_URL = "http://localhost:7000/api";

export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    // clone options so we don't mutate the passed object
    const fetchOptions = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    };

    // only add Authorization if token is present
    if (token) {
        fetchOptions.headers.Authorization = `Bearer ${token}`;
    }

    // if body is an object, stringify it
    if (fetchOptions.body && typeof fetchOptions.body === "object") {
        fetchOptions.body = JSON.stringify(fetchOptions.body);
    }

    const res = await fetch(`${API_URL}${url}`, fetchOptions);

    if (!res.ok) {
        // try to parse JSON error if possible
        let errText;
        try {
            errText = await res.json();
        } catch {
            errText = { message: `HTTP ${res.status}` };
        }
        throw errText;
    }

    return res.json();
};
