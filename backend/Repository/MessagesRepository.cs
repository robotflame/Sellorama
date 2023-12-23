using Microsoft.EntityFrameworkCore;
using sello.Data;
using sello.Interface;
using sello.Models;
using sello.Models.User;

namespace sello.Implementation {
    public class MessagesRepository : IMessages {
        readonly DatabaseContext _dbContext;
        private readonly DbSet<Message> _dbSet;
        
        public MessagesRepository(DatabaseContext dbContext) {
            _dbContext = dbContext;
            _dbSet = dbContext.Messages;
        }
        
        public async Task AddMessageAsync(Message message) {
            await _dbSet.AddAsync(message);
            await _dbContext.SaveChangesAsync();
        }

        public IOrderedQueryable<Message> GetUserMessagesByTime(ulong user1, ulong user2) {
            var result = _dbSet
                .Where(m => 
                    (m.ReceivingId == user1) && (m.SendingId == user2) ||
                    (m.ReceivingId == user2) && (m.SendingId == user1)
                )
                .OrderBy(m => m.Timestamp); // Assuming you have a Timestamp field
            return result;
        }

        public async Task<List<ulong>> GetUniqueUsersChat(User user) {
            var uniqueConnections = await _dbSet.Where(message => message.SendingId == user.Id || message.ReceivingId == user.Id)
                .Select(message => new { message.ReceivingId, message.SendingId })
                .Distinct()
                .ToListAsync();

            var result = new List<ulong>();

            foreach (var conversation in uniqueConnections) {
                if (conversation.SendingId != user.Id && !result.Contains(conversation.SendingId))
                    result.Add(conversation.SendingId);
                
                if (conversation.ReceivingId != user.Id && !result.Contains(conversation.ReceivingId))
                    result.Add(conversation.ReceivingId);
            }

            return result;
        }
        
        
    }
}