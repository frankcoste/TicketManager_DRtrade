'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../utils/api';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const passwordInvalid = password.length > 0 && password.length < 8;
    const passwordValid = password.length >= 8;

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
        <div className="min-h-screen flex flex-col bg-[#f6f6f8] font-sans">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />

            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-[480px] bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">

                    {/* Header */}
                    <div className="p-8 text-center border-b border-slate-100">
                        <div className="flex justify-center mb-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <span className="material-symbols-outlined text-[#2463eb] text-3xl">confirmation_number</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">DRtrade Tickets</h1>
                        <p className="text-slate-500 mt-2 text-sm">Efficient support management platform</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        <Link href="/login" className="flex-1 py-4 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-[#2463eb] transition-colors text-center">
                            Login
                        </Link>
                        <button className="flex-1 py-4 text-sm font-semibold border-b-2 border-[#2463eb] text-[#2463eb]">
                            Register
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* API Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#2463eb] outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    placeholder="Minimum 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-12 py-3 bg-white border rounded-lg focus:ring-2 outline-none transition-all placeholder:text-slate-400 text-slate-900 ${passwordInvalid
                                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                            : passwordValid
                                                ? 'border-green-500 focus:ring-green-200 focus:border-green-500'
                                                : 'border-slate-300 focus:ring-blue-200 focus:border-[#2463eb]'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {password.length > 0 && (
                                <p className={`text-xs flex items-center gap-1 mt-1 ${passwordInvalid ? 'text-red-500' : 'text-green-600'}`}>
                                    <span className="material-symbols-outlined text-xs">
                                        {passwordInvalid ? 'error' : 'check_circle'}
                                    </span>
                                    {passwordInvalid
                                        ? `The password must be at least 8 characters long. (${8 - password.length} more)`
                                        : 'Valid password'
                                    }
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || passwordInvalid || password.length === 0}
                            className="w-full bg-[#2463eb] hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                            {!isLoading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full py-6 px-4 text-center">
                <p className="text-slate-400 text-sm font-medium tracking-wide">
                    Prueba Técnica DRtrade © 2026
                </p>
            </footer>
        </div>
    );
}