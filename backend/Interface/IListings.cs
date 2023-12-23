using sello.Models;

namespace sello.Interface {
    public interface IListings {
        public Task<Listing?> GetListingAsync(ulong id);
        public Task AddListingAsync(Listing listing);
        public Task UpdateListingAsync(Listing listing);
        public bool HasListing(ulong id);
        public IQueryable<Listing> AsQueryable();
        public Task<Listing?> DeleteListingAsync(ulong id);
    }
}