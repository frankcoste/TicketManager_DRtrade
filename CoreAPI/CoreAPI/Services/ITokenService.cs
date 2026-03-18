using CoreAPI.Models;

namespace CoreAPI.Services
{
    public interface ITokenService
    {
        string GenerateJwtToken(User user);
    }
}
