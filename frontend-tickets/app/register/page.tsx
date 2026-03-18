'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../utils/api';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                alert('¡Cuenta creada con éxito! Por favor inicia sesión.');
                router.push('/login');
            } else {
                const errorData = await response.text();
                setError(errorData || 'No se pudo crear la cuenta. Verifica los datos.');
            }
        } catch (err) {
            setError('Error al conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96 text-black">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Crear Cuenta</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1 text-sm font-semibold">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1 text-sm font-semibold">Contraseña</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                                password.length === 0
                                    ? 'focus:ring-green-500'
                                    : password.length < 8
                                    ? 'border-red-400 focus:ring-red-400'
                                    : 'border-green-500 focus:ring-green-500'
                            }`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                        />
                        {password.length > 0 && (
                            <p className={`text-xs mt-1 ${
                                password.length < 8 ? 'text-red-500' : 'text-green-600'
                            }`}>
                                {password.length < 8
                                    ? `Faltan ${8 - password.length} caracteres más`
                                    : '✓ Contraseña válida'
                                }
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || password.length < 8}
                        className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>

                {/* Enlace para volver al Login */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                        Inicia sesión aquí
                    </Link>
                </div>
            </div>
        </div>
    );
}