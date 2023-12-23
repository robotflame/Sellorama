using sello.Models;

namespace sello.Interface {
    public interface IReviews {
        public ValueTask<Review?> GetReviewAync(ulong id);
        public Task<List<Review>> GetReviewsByReviewer(string reviewer);
        public Task<List<Review>> GetReviewsByReviewee(string reviewee);
        
        public Task AddReviewAsync(Review review);
    }
}