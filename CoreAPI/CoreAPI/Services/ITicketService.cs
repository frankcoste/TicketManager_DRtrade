using CoreAPI.Models;

namespace CoreAPI.Services
{
    public interface ITicketService
    {
    Task<Ticket> CreateTicketAsync(Ticket ticket, int userId);
    Task<(IEnumerable<Ticket> Tickets, int TotalCount)> GetTicketsAsync(int userId, UserRole role, int page = 1, int pageSize = 10);
    Task<bool> CloseTicketAsync(int ticketId);
    Task<(int Open, int Closed)> GetTicketStatsAsync(int userId, UserRole role);
    }
}