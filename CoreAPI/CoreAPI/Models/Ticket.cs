using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoreAPI.Models
{
    public class Ticket
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        // El campo Status debe inicializarse como Open por defecto
        [Required]
        public TicketStatus Status { get; set; } = TicketStatus.Open;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Clave Foránea 
        [Required]
        public int UserId { get; set; }

        // Propiedad de navegación: Un Ticket pertenece a un Usuario 
        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;
    }
}