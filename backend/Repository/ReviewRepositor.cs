using sello.Interface;
using Microsoft.EntityFrameworkCore;
using sello.Data;
using sello.Models;
using sello.Models.User;

namespace sello.Implementation {
    public class ReviewsRepository : IReviews {
        readonly DatabaseContext _dbContext;
        
        public ReviewsRepository(DatabaseContext dbContext) {
            _dbContext = dbContext;
        }

        public ValueTask<Review?> GetReviewAync(ulong id) {
            return _dbContext.Review.FindAsync(id);
        }

        public Task<List<Review>> GetReviewsByReviewer(string reviewer) {
            return _dbContext.Review
                .Where(r => r.Reviewer.Username == reviewer)
                .ToListAsync();
        }

        public Task<List<Review>> GetReviewsByReviewee(string reviewee) {
            return _dbContext.Review
                .Where(r => r.Reviewee.Username == reviewee)
                .ToListAsync();
        }

        public async Task AddReviewAsync(Review review) {
            await _dbContext.Review.AddAsync(review);
            await _dbContext.SaveChangesAsync();
        }
    }
}