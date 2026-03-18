const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    let token: string | null = null;

    // Verificamos que estemos en el navegador antes de usar localStorage
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('jwt_token');
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
        }
    }

    return response;
};