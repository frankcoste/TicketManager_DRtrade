using Microsoft.EntityFrameworkCore;
using CoreAPI.Models;

namespace CoreAPI.Services
{
    public partial class TicketService : ITicketService
    {
        private readonly BDContext _context;

        public TicketService(BDContext context)
        {
            _context = context;
        }

        public async Task<bool> CloseTicketAsync(int ticketId)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null) return false;

            ticket.Status = TicketStatus.Closed;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Ticket> CreateTicketAsync(Ticket ticket, int userId)
        {
            ticket.UserId = userId;
            ticket.CreatedAt = DateTime.UtcNow;
            ticket.Status = TicketStatus.Open;

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return ticket;
        }

        public async Task<(IEnumerable<Ticket> Tickets, int TotalCount)> GetTicketsAsync(int userId, UserRole role, int page = 1, int pageSize = 10)
        {

            IQueryable<Ticket> query = _context.Tickets;

            if (role != UserRole.Admin)
            {
                query = query.Where(t => t.UserId == userId);
            }

            int totalCount = await query.CountAsync();

             var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (tickets, totalCount);
        }

        public async Task<(int Open, int Closed)> GetTicketStatsAsync(int userId, UserRole role)
        {
            IQueryable<Ticket> query = _context.Tickets;

            if (role != UserRole.Admin)
            {
                query = query.Where(t => t.UserId == userId);
            }

            int open = await query.CountAsync(t => t.Status == TicketStatus.Open);
            int closed = await query.CountAsync(t => t.Status == TicketStatus.Closed);

            return (open, closed);
        }
    }
}