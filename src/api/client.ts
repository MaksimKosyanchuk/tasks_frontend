const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(
    path: string,
    options: RequestInit = {},
    accessToken: string = ""
) {

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(accessToken && {
                Authorization: `Bearer ${accessToken}`,
            }),
            ...options.headers,
        },
    });

    return response;
}