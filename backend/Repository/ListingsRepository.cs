using sello.Interface;
using Microsoft.EntityFrameworkCore;
using sello.Data;
using sello.Models;
using sello.Models.User;

namespace sello.Implementation {
    public class ListingsRepository : IListings {
        readonly DatabaseContext _dbContext;
        
        public ListingsRepository(DatabaseContext dbContext) {
            _dbContext = dbContext;
        }

        public Task<Listing?> GetListingAsync(ulong id) {
            return _dbContext.Listings.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task AddListingAsync(Listing listing) {
            await _dbContext.Listings.AddAsync(listing);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateListingAsync(Listing listing) {
            _dbContext.Entry(listing).State = EntityState.Modified;
            await _dbContext.SaveChangesAsync();
        }

        public bool HasListing(ulong id) {
            return _dbContext.Listings.Any(e => e.Id == id);
        }

        public IQueryable<Listing> AsQueryable() {
            return _dbContext.Listings.AsQueryable();
        }
        
        public async Task<Listing?> DeleteListingAsync(ulong id) {
            var listing = await _dbContext.Listings.FindAsync(id);
            if (listing is null)
                return null;
            
            _dbContext.Listings.Remove(listing);
            await _dbContext.SaveChangesAsync();
            
            return listing;
        }
    }
}