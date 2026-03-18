using Microsoft.EntityFrameworkCore;
using BCrypt;
using CoreAPI.Models;

namespace CoreAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly BDContext _context;
        private readonly ITokenService _tokenService;

        public AuthService(BDContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }
        public async Task<string?> LoginAsync(string email, string password)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);

            if(usuario == null)
            {
                return null;
            }

            bool passwordValida = BCrypt.Net.BCrypt.Verify(password, usuario.Password);

            if (!passwordValida)
            {
                return null;
            }

            return _tokenService.GenerateJwtToken(usuario);
        }

        public async Task<bool> RegisterAsync(string email, string password)
        {
            // "Busca en la tabla Usuarios si ALGUNO cumple que su Email sea igual al que recibimos"
            bool existe = await _context.Usuarios.AnyAsync(u => u.Email == email);
            if (existe)
            {
                return false;
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            var nuevoUsuario = new User
            {
                Email = email,
                Password = passwordHash,
                Role = UserRole.User // Asignamos el rol de usuario por defecto
            };

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
