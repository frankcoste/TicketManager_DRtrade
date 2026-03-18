'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../utils/api';
import { jwtDecode } from 'jwt-decode';
import TicketChart from '../components/TicketChart';

interface Ticket {
    id: number;
    userEmail: string;
    title: string;
    description: string;
    status: number;
    createdAt: string;
}

export default function DashboardPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // Crear ticket
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Usuario
    const [userRole, setUserRole] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Stats
    const [stats, setStats] = useState({ open: 0, closed: 0 });

    // Búsqueda
    const [search, setSearch] = useState('');

    const router = useRouter();

    const fetchStats = async () => {
        try {
            const response = await apiFetch('/tickets/stats');
            if (response.ok) {
                const data = await response.json();
                setStats({ open: data.open, closed: data.closed });
            }
        } catch (err) {
            console.error('Error cargando estadísticas');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            router.push('/login');
            return;
        }
        try {
            const decoded: any = jwtDecode(token);
            const role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            const email = decoded['email'] || decoded['sub'] || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
            setUserRole(role);
            setUserEmail(email);
        } catch (e) {
            console.error('Error al decodificar el token', e);
        }
        fetchTickets(1);
        fetchStats();
    }, []);

    useEffect(() => {
        fetchTickets(currentPage);
    }, [currentPage]);

    const fetchTickets = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await apiFetch(`/tickets?page=${page}&pageSize=${pageSize}`);
            if (response.ok) {
                const data = await response.json();
                setTickets(data.tickets || []);
                const total = data.totalCount || 0;
                setTotalCount(total);
                setTotalPages(Math.ceil(total / pageSize) || 1);
            } else {
                setTickets([]);
                setError('No se pudieron cargar los tickets.');
            }
        } catch (err) {
            setTickets([]);
            setError('Error de conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const response = await apiFetch('/tickets', {
                method: 'POST',
                body: JSON.stringify({ title: newTitle, description: newDescription }),
            });
            if (response.ok) {
                setNewTitle('');
                setNewDescription('');
                setShowCreateForm(false);
                fetchTickets(currentPage);
                fetchStats();
            } else {
                alert('Hubo un error al crear el ticket.');
            }
        } catch (err) {
            alert('Error de conexión al intentar crear el ticket.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCloseTicket = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas cerrar este ticket?')) return;
        try {
            const response = await apiFetch(`/tickets/${id}/close`, { method: 'PATCH' });
            if (response.ok) {
                fetchTickets(currentPage);
                fetchStats();
            } else if (response.status === 403 || response.status === 400) {
                alert('Acceso Denegado: No tienes permisos de Administrador para cerrar tickets.');
            } else {
                alert('Ocurrió un error al intentar cerrar el ticket.');
            }
        } catch (err) {
            alert('Error de conexión con el servidor.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        router.push('/login');
    };

    const total = stats.open + stats.closed;
    const openPct = total > 0 ? Math.round((stats.open / total) * 100) : 0;
    const closedPct = total > 0 ? Math.round((stats.closed / total) * 100) : 0;

    // Iniciales del email para el avatar
    const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'U';

    // Filtrado local por búsqueda
    const filtered = tickets.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        String(t.id).includes(search)
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] font-sans">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />

            {/* ── Sidebar ── */}
            <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3 text-[#2463eb]">
                        <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">TicketManager</h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                        {userRole === 'Admin' ? 'Admin Dashboard' : 'User Dashboard'}
                    </p>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#2463eb] text-white font-medium text-sm">
                        <span className="material-symbols-outlined text-xl">confirmation_number</span>
                        {userRole === 'Admin' ? 'All Tickets' : 'My Tickets'}
                    </button>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                        New Ticket
                    </button>
                </nav>

                {/* User profile + logout */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-[#2463eb] flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{userEmail || 'User'}</p>
                            <p className="text-xs text-slate-600 font-medium">{userRole || 'User'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-2 w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 overflow-y-auto">

                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search tickets or IDs..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2463eb] focus:border-[#2463eb] text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2463eb] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow shadow-blue-200"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Create Ticket
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg text-[#2463eb] shrink-0">
                                <span className="material-symbols-outlined text-3xl">list_alt</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Tickets</p>
                                <p className="text-2xl font-bold text-slate-900">{total || totalCount}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="bg-amber-100 p-3 rounded-lg text-amber-600 shrink-0">
                                <span className="material-symbols-outlined text-3xl">pending</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Open Tickets</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.open}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600 shrink-0">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Closed Tickets</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.closed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Distribution */}
                    {(stats.open > 0 || stats.closed > 0) && (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="w-full md:w-1/2">
                                    <h2 className="text-lg font-bold mb-1 text-slate-900">Ticket Distribution</h2>
                                    <p className="text-slate-500 text-sm mb-6">Real-time overview of current ticket status.</p>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="flex items-center gap-2 text-slate-800 font-semibold">
                                                    <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
                                                    Open Tickets
                                                </span>
                                                <span className="font-bold text-slate-900">{openPct}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                                <div className="bg-[#22c55e] h-full rounded-full transition-all" style={{ width: `${openPct}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="flex items-center gap-2 text-slate-800 font-semibold">
                                                    <span className="w-3 h-3 rounded-full bg-[#94a3b8] inline-block"></span>
                                                    Closed Tickets
                                                </span>
                                                <span className="font-bold text-slate-900">{closedPct}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                                <div className="bg-[#94a3b8] h-full rounded-full transition-all" style={{ width: `${closedPct}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TicketChart (recharts) */}
                                <div className="flex-1 min-h-[220px]">
                                    <TicketChart open={stats.open} closed={stats.closed} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tickets Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                {userRole === 'Admin' ? 'All Support Tickets' : 'My Tickets'}
                            </h3>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                Create Ticket
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Loading tickets...
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center gap-2 py-12 text-red-500 text-sm">
                                <span className="material-symbols-outlined">error</span>
                                {error}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                                <span className="material-symbols-outlined text-4xl">inbox</span>
                                <p className="text-sm">No tickets found. Create one to get started!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                            {userRole === 'Admin' && (
                                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Email</th>
                                            )}
                                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            {userRole === 'Admin' && (
                                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-8 py-4 font-mono text-sm text-slate-400">
                                                    #{String(ticket.id).padStart(4, '0')}
                                                </td>
                                                {userRole === 'Admin' && (
                                                    <td className="px-8 py-4 text-sm text-slate-500">
                                                        {ticket.userEmail}
                                                    </td>
                                                )}
                                                <td className="px-8 py-4">
                                                    <p className="text-sm font-medium text-slate-800 max-w-xs truncate">{ticket.title}</p>
                                                    <p className="text-xs text-slate-400 truncate max-w-xs">{ticket.description}</p>
                                                </td>
                                                <td className="px-8 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-4">
                                                    {ticket.status === 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                                                            Open
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                                            Closed
                                                        </span>
                                                    )}
                                                </td>
                                                {userRole === 'Admin' && (
                                                    <td className="px-8 py-4 text-right">
                                                        {ticket.status === 0 ? (
                                                            <button
                                                                onClick={() => handleCloseTicket(ticket.id)}
                                                                className="px-4 py-1.5 bg-[#2463eb] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                Close Ticket
                                                            </button>
                                                        ) : (
                                                            <span className="px-4 py-1.5 border border-slate-200 text-slate-400 text-xs font-bold rounded-lg inline-block">
                                                                Closed
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && totalPages >= 1 && (
                            <div className="px-8 py-4 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing page {currentPage} of {totalPages} ({totalCount} tickets)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-slate-400 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base leading-none">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-slate-400 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Create Ticket Modal ── */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Create New Ticket</h2>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Title</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">title</span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Brief description of the issue"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#2463eb] outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    required
                                    placeholder="Describe the problem in detail..."
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#2463eb] outline-none transition-all h-28 resize-none text-slate-900 text-sm"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 py-3 bg-[#2463eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60"
                                >
                                    {isCreating ? 'Sending...' : 'Publish Ticket'}
                                    {!isCreating && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}