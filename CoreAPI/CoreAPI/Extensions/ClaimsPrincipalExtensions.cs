using System.Security.Claims;
using CoreAPI.Models;

namespace CoreAPI.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var userIdString = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                throw new UnauthorizedAccessException("El ID de usuario no está presente en el token.");
            }
            return int.Parse(userIdString);
        }

        public static UserRole GetUserRole(this ClaimsPrincipal user)
        {
            var roleString = user.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(roleString))
            {
                throw new UnauthorizedAccessException("El rol no está presente en el token.");
            }
            return Enum.Parse<UserRole>(roleString);
        }
    }
}
