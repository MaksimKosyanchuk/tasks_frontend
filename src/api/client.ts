const API_URL = "http://localhost:3001";

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