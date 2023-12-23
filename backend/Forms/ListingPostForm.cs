using sello.Models;

namespace sello.Forms {
    public class ListingPostForm {
        public IFormFileCollection files { get; set; }
        
        public ListingPostForm() {}

        public ListingPostForm(long price, Condition condition, string Model, string manufacturer, string description) {
            this.Price = price;
            this.Condition = condition;
            //this.ModelId = modelId; TODO make model its own thing and only ref it by id
            this.Model = Model;
            this.Manufacturer = manufacturer;
            this.Description = description;

            this.files = new FormFileCollection();
        }
        
        // Listing
        public long Price { get; set; } // NOK ører
        public Condition Condition { get; set; }
        public string Model { get; set; }
        // public ulong? ModelId { get; set; } = null;  // foreign key TODO make model its own thing and only ref it by id
        public string Manufacturer { get; set; }
        public string Description { get; set; }
    }
}