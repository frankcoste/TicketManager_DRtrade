'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../utils/api';
import { jwtDecode } from 'jwt-decode';
import TicketChart from '../components/TicketChart';

interface Ticket {
    id: number;
    title: string;
    description: string;
    status: number;
    createdAt: string;
}

export default function DashboardPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // Estados para crear un nuevo ticket
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [stats, setStats] = useState({ open: 0, closed: 0 });

    const router = useRouter();

    const fetchStats = async () => {
        try {
            const response = await apiFetch('/tickets/stats');
            if (response.ok) {
                const data = await response.json();
                setStats({ open: data.open, closed: data.closed });
            }
        } catch (err) {
            console.error("Error cargando estadísticas");
        }
    };
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);

                // Extraemos el rol (usando la ruta larga que suele poner .NET)
                const role = decoded["role"] || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                setUserRole(role);
                console.log("Rol detectado:", role);

            } catch (e) {
                console.error("Error al decodificar el token", e);
            }
        }
        fetchTickets();
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

    // FUNCIÓN PARA CREAR TICKET
    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const response = await apiFetch('/tickets', {
                method: 'POST',
                body: JSON.stringify({ title: newTitle, description: newDescription }),
            });

            if (response.ok) {
                // Limpiamos el formulario y recargamos la lista
                setNewTitle('');
                setNewDescription('');
                fetchTickets(currentPage);
                fetchStats();
            } else {
                alert('Hubo un error al crear el ticket.');
            }
        } catch (err) {
            alert('Error de conexión al intentar crear el ticket.');
        } finally {
            setIsLoading(false);
            setIsCreating(false);
        }
    };

    const handleCloseTicket = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas cerrar este ticket?')) return;

        try {
            const response = await apiFetch(`/tickets/${id}/close`, {
                method: 'PATCH',
            });

            if (response.ok) {
                alert('Ticket cerrado con éxito.');
                fetchTickets(currentPage); // Recargamos para ver el cambio de estado
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

    return (
        <div className="min-h-screen bg-gray-100 p-8 text-black">
            <div className="max-w-4xl mx-auto">

                {/* Encabezado */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
                    <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition">
                        Cerrar Sesión
                    </button>
                </div>

                {/* FORMULARIO PARA CREAR TICKET */}
                <div className="bg-white p-6 rounded-lg shadow mb-8 border-t-4 border-green-500">
                    <h2 className="text-lg font-bold mb-4">Crear Nuevo Ticket</h2>
                    <form onSubmit={handleCreateTicket} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                required
                                placeholder="Título del problema (ej. Falla en el servidor)"
                                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <textarea
                                required
                                placeholder="Describe el problema a detalle..."
                                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            {isCreating ? 'Enviando...' : 'Publicar Ticket'}
                        </button>
                    </form>
                </div>
                <div className="max-w-4xl mx-auto">
                    {/* GRÁFICO DINÁMICO */}
                    {!isLoading && (stats.open > 0 || stats.closed > 0) && (
                        <TicketChart open={stats.open} closed={stats.closed} />
                    )}
                </div>
                {/* LISTA DE TICKETS */}
                <h2 className="text-xl font-bold mb-4 text-gray-700">Tickets Recientes</h2>

                {isLoading && <p className="text-center text-gray-500">Cargando tickets...</p>}
                {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded">{error}</p>}

                {!isLoading && tickets.length === 0 && !error && (
                    <p className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
                        No hay tickets para mostrar. ¡Crea uno arriba!
                    </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{ticket.title}</h3>
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${ticket.status === 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                                        {ticket.status === 0 ? 'ABIERTO' : 'CERRADO'}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4 text-sm">{ticket.description}</p>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <p className="text-xs text-gray-400">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </p>
                                {/* BOTÓN DE CERRAR TICKET (Solo visible si está abierto y es Admin) */}
                                {ticket.status === 0 && userRole === 'Admin' && (
                                    <button
                                        onClick={() => handleCloseTicket(ticket.id)}
                                        className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-black transition"
                                    >
                                        Marcar como Cerrado
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CONTROLES DE PAGINACIÓN */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-between items-center mt-8 bg-white p-4 rounded-lg shadow">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            ← Anterior
                        </button>
                        <span className="text-gray-600 font-medium">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            Siguiente →
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}