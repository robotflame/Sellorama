using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sello.Interface;
using sello.Models;
using sello.Interface;
using sello.Models.User;

namespace sello.Controllers {
    [ApiController]
    [Route("api/chat")]
    public class MessageController : ControllerBase {
        private readonly IMessages _Messages;
        private readonly IUsers _Users;
        
        public MessageController(IMessages messages, IUsers users) {
            _Messages = messages;
            _Users = users;
        }

        [Authorize]
        [HttpGet("load-chat/{otherId}")]
        public async Task<ActionResult<Message[]>> LoadPreviousMessages(ulong otherId) {
            var user = await this.GetUser(HttpContext.User);
            var messages = await _Messages.GetUserMessagesByTime(user.Id, otherId).ToArrayAsync();
            //Console.WriteLine($"Catching up to messages({messages.Length}) from {otherId}");
            return messages;
        }

        private async Task<User?> GetUser(ClaimsPrincipal? claims) {
            if (claims is null)
                return null; // TODO send error to client

            var userIdClaim = claims.Claims.ToList().Find(c => c.Type == "Id");
            if (userIdClaim is null)
                return null; // TODO send error to client

            var userId = ulong.Parse(userIdClaim.Value);
            var user = await this._Users.GetUserAsync(userId, "");
            return user ?? null; // TODO send error to client
        }
    }
}