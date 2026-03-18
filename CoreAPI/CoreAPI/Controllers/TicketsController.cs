using System.Security.Claims;
using CoreAPI.DTOs;
using CoreAPI.Extensions;
using CoreAPI.Models;
using CoreAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTickets([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                int userId = User.GetUserId();
                var role = User.GetUserRole();

                var tickets = await _ticketService.GetTicketsAsync(userId, role, page, pageSize);

                var ticketDtos = tickets.Tickets.Select(t => new TicketDto
                {
                    Id = t.Id,
                    UserEmail = t.User.Email,
                    Title = t.Title,
                    Description = t.Description,
                    Status = (int)t.Status,
                    CreatedAt = t.CreatedAt
                });

                return Ok(new
                {
                    tickets = ticketDtos,
                    totalCount = tickets.TotalCount
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] TicketRegisterDto model)
        {
            try
            {
                int userId = User.GetUserId();

                var nuevoTicket = new Ticket
                {
                    Title = model.Title,
                    Description = model.Description
                };

                var ticketCreado = await _ticketService.CreateTicketAsync(nuevoTicket, userId);

                return StatusCode(201, ticketCreado);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/close")]
        public async Task<ActionResult> CloseTicket(int id)
        {
            var result = await _ticketService.CloseTicketAsync(id);

            if (!result)
            {
                return BadRequest("No se pudo cerrar el ticket. Verifica que el ticket exista.");
            }

            return NoContent();
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetTicketStats()
        {
            int userId = User.GetUserId();
            var role = User.GetUserRole();

            var (open, closed) = await _ticketService.GetTicketStatsAsync(userId, role);

            return Ok(new { open, closed });
        }
    }
}