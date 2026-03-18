using Microsoft.EntityFrameworkCore;
using CoreAPI.Models;

namespace CoreAPI
{
    public class BDContext : DbContext
    {
        public BDContext(DbContextOptions<BDContext> options) : base(options) { }

        public DbSet<User> Usuarios { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
    }
}
