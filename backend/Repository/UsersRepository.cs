using sello.Interface;
using Microsoft.EntityFrameworkCore;
using sello.Data;
using sello.Models;
using sello.Models.User;

namespace sello.Implementation {
    public class UsersRepository : IUsers {
        readonly DatabaseContext _dbContext;
        
        public UsersRepository(DatabaseContext dbContext) {
            _dbContext = dbContext;
        }
        
        public List<User> GetUsers(string include) {
            if (include.Length == 0)
                return _dbContext.Users.ToList();
            return _dbContext.Users.Include(include).ToList();
        }

        public Task<List<User>> GetUsersAsync(string include) {
            if (include.Length == 0)
                return _dbContext.Users.ToListAsync();
            return _dbContext.Users.Include(include).ToListAsync();
        }

        public User? GetUser(ulong id, string include) {
            if (include.Length == 0)
                return _dbContext.Users.FirstOrDefault(u => u.Id == id);
            return _dbContext.Users.Include(include).FirstOrDefault(u => u.Id == id);
        }

        public Task<User?> GetUserAsync(ulong id, string include) {
            if (include.Length == 0)
                return _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
            return _dbContext.Users.Include(include).FirstOrDefaultAsync(u => u.Id == id);
        }

        public void AddUser(User user) {
            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();
        }

        public async Task AddUserAsync(User user) {
            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();
        }

        public void UpdateUser(User user) {
            _dbContext.Entry(user).State = EntityState.Modified;
            _dbContext.SaveChanges();
        }

        public async Task UpdateUserAsync(User user) {
            _dbContext.Entry(user).State = EntityState.Modified;
            await _dbContext.SaveChangesAsync();
        }

        public User? DeleteUser(ulong id) {
            var user = _dbContext.Users.Find(id);
            if (user is null)
                return null;
            
            _dbContext.Users.Remove(user);
            _dbContext.SaveChanges();
            
            return user;
        }

        public async Task<User?> DeleteUserAsync(ulong id) {
            var user = await _dbContext.Users.FindAsync(id);
            if (user is null)
                return null;
            
            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();
            
            return user;
        }

        public bool HasUser(ulong id) {
            return _dbContext.Users.Any(e => e.Id == id);
        }

        public Task<User?> GetUserAsyncByEmail(string authEmail) {
            return _dbContext.Users.FirstOrDefaultAsync(u => u.Email == authEmail);
        }
    }
}