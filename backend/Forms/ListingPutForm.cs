using sello.Models;

namespace sello.Forms {
    public class ListingPutForm {
        public IFormFileCollection? files { get; set; }
        
        public ListingPutForm() {}

        public ListingPutForm(long price, Condition condition, string Model, string manufacturer, string description) {
            this.Price = price;
            this.Condition = condition;
            //this.ModelId = modelId; TODO make model its own thing and only ref it by id
            this.Model = Model;
            this.Manufacturer = manufacturer;
            this.Description = description;

            this.files = new FormFileCollection();
        }

        public void Impose(Listing target) {
            if (this.Price != null)
                target.Price = this.Price.Value;
            
            if (this.Condition != null)
                target.Condition = this.Condition.Value;
            
            if (this.Model != null)
                target.Model = this.Model;
            
            if (this.Manufacturer != null)
                target.Manufacturer = this.Manufacturer;
            
            if (this.Description != null)
                target.Description = this.Description;
        }
        
        // Listing
        public long? Price { get; set; } // NOK ører
        public Condition? Condition { get; set; }
        public string? Model { get; set; }
        
        public string[]? ImagesToDelete { get; set; }
        public string? Manufacturer { get; set; }
        public string? Description { get; set; }
    }
}