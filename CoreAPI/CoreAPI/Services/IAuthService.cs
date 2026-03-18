using Microsoft.IdentityModel.JsonWebTokens;

namespace CoreAPI.Services
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(string email, string password);
        Task<string?> LoginAsync(string email, string password);

    }
}
