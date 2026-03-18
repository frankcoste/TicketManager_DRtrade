using System.ComponentModel.DataAnnotations;

namespace CoreAPI.DTOs;

public class UserRegisterDto {
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    public required string Password { get; set; }
}

public class UserLoginDto {
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }
}

public class TicketRegisterDto
{
    [Required]
    [MaxLength(100)]
    public required string Title { get; set; }

    [Required]
    public required string Description { get; set; }
}

public class TicketDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

