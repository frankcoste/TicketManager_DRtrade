using System.ComponentModel.DataAnnotations;
using System.Net.Sockets;

namespace CoreAPI.Models { 
    public class User
    {
        [Key]
        public int Id { get; set; } 
    
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty; 
    
        [Required]
        public string Password { get; set; } = string.Empty; // Nota: Aquí guardaremos el hash, no la contraseña en texto plano.
    
        [Required]
        public UserRole Role { get; set; } = UserRole.User; 
    
        // Propiedad de navegación: Un Usuario puede tener muchos Tickets 
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}