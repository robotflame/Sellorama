using sello.Models.User;

namespace sello.Interface {
    public interface IUsers {
        public List<User> GetUsers(string include);
        public Task<List<User>> GetUsersAsync(string include);
        
        public User? GetUser(ulong id, string include);
        public Task<User?> GetUserAsync(ulong id, string include);
        
        public void AddUser(User user);
        public Task AddUserAsync(User user);
        
        public void UpdateUser(User user);
        public Task UpdateUserAsync(User user);
        
        public User? DeleteUser(ulong id);
        public Task<User?> DeleteUserAsync(ulong id);
        
        public bool HasUser(ulong id);
        Task<User?> GetUserAsyncByEmail(string authEmail);
    }
}