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
    public string UserEmail { get; set; } = string.Empty;
    public string Title { get; set; }
    public string Description { get; set; }
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

