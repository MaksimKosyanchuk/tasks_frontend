import { apiFetch } from "./client";

export async function refreshAccessToken() {
    const response = await apiFetch("/auth/refresh", {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Unauthorized");
    }

    return response.json() as Promise<{
        accessToken: string;
    }>;
}

export async function register(nickName: string, email: string, password: string) {
    const response = await apiFetch("/auth/register",
        {
            method: "Post" ,
            body: JSON.stringify({
                nickName,
                email,
                password,
            }),
        })

    if (!response.ok) {
        const error = await response.json();
        throw new Error( error.message || "Registration failed" ); 
    }

    return response.json() as Promise<{
        id: string,
        nickName: string,
        email: string
    }>
}

export async function login(email: string, password: string) {
    const response = await apiFetch("/auth/login", {
        method: "Post",
        body: JSON.stringify({
            email,
            password
        })
     }) 

    if(!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
    }

    return response.json() as Promise<{ accessToken: string }>
}