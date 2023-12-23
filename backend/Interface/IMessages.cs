using sello.Models;
using sello.Models.User;

namespace sello.Interface {
    public interface IMessages {
        public Task AddMessageAsync(Message message);

        public IOrderedQueryable<Message> GetUserMessagesByTime(ulong user1, ulong user2);

        public Task<List<ulong>> GetUniqueUsersChat(User user);
    }   
}