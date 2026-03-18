'use client';
import * as recharts from 'recharts';

interface TicketChartProps {
    open: number;
    closed: number;
}

export default function TicketChart({ open, closed }: TicketChartProps) {
    const data = [
        { name: 'Open', value: open },
        { name: 'Closed', value: closed },
    ];

    // Colores para el gráfico: Verde para abierto, Gris para cerrado
    const COLORS = ['#22c55e', '#94a3b8'];

    return (
        <div className="bg-white p-12 rounded-lg shadow mb-8 h-80">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Ticket Status</h2>
            <recharts.ResponsiveContainer width="100%" height="100%">
                <recharts.PieChart>
                    <recharts.Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <recharts.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </recharts.Pie>
                    <recharts.Tooltip />
                    <recharts.Legend />
                </recharts.PieChart>
            </recharts.ResponsiveContainer>
        </div>
    );
}
