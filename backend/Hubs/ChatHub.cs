using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using sello.Interface;
using sello.Models;
using sello.Models.User;

namespace sello.Hubs {
    [Authorize]
    public class ChatHub : Hub {
        private readonly IMessages _IMessages;
        private readonly IUsers _IUsers;

        public ChatHub(IMessages messages, IUsers users) {
            _IMessages = messages;
            _IUsers = users;
        }
        
        public override async Task OnConnectedAsync() {
            var connectingUser = await this.GetUser(Context.User);
            Console.WriteLine($"trying to connect as {connectingUser.Username}");
            await Groups.AddToGroupAsync(Context.ConnectionId, connectingUser.Id.ToString());
            await base.OnConnectedAsync();
        }
        
        public async Task SendMessage(string targetUserId, string messageContent) {
            var sendingUser = await this.GetUser(Context.User);
            var receivingUser = await _IUsers.GetUserAsync(ulong.Parse(targetUserId), "");
            Console.WriteLine($"trying to send message as {sendingUser.Username} to {receivingUser.Username}");
            
            var message = new Message {
                ReceivingId = receivingUser.Id,
                SendingId = sendingUser.Id,
                Content = messageContent,
                Timestamp = DateTime.UtcNow
            };
            await _IMessages.AddMessageAsync(message);
            await Clients.Group(receivingUser.Id.ToString()).SendAsync("ReceiveMessage", message);
            await Clients.Group(sendingUser.Id.ToString()).SendAsync("ReceiveMessage", message);
        }

        private async Task<User?> GetUser(ClaimsPrincipal? claims) {
            if (claims is null)
                return null; // TODO send error to client

            var userIdClaim = claims.Claims.ToList().Find(c => c.Type == "Id");
            if (userIdClaim is null)
                return null; // TODO send error to client

            var userId = ulong.Parse(userIdClaim.Value);
            var user = await _IUsers.GetUserAsync(userId, "");
            return user ?? null; // TODO send error to client
        }
    }
}