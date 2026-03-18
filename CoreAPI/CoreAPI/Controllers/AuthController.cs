using Microsoft.AspNetCore.Mvc;
using CoreAPI.Services;
using CoreAPI.DTOs;

namespace CoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // La ruta será: api/auth
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
    

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] UserRegisterDto model)
        {
            var result = await _authService.RegisterAsync(model.Email, model.Password);
            if (!result)
            {
                return BadRequest("Error al registrar el usuario");
            }
            return Ok("Usuario registrado correctamente");
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] UserLoginDto model)
        {
            var token = await _authService.LoginAsync(model.Email, model.Password);
            if (token == null)
            {
                return BadRequest("Credenciales inválidas");
            }
            return Ok(new { token });
        }
    }
}
