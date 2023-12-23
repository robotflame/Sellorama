using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text.Json.Serialization;
using sello.Forms;

namespace sello.Models {
    public class Listing {
        public Listing() {}

        public Listing(ListingPostForm listingForm) {
            this.Price = listingForm.Price;
            //this.ModelId = listingForm.ModelId; TODO make MODEL NOT STRING
            this.Model = listingForm.Model;
            this.Condition = listingForm.Condition;
            this.Manufacturer = listingForm.Manufacturer;
            this.Description = listingForm.Description;
        }
        
        [Key]
        public ulong? Id { get; set; }
        public long Price { get; set; } // NOK ører
        public Condition Condition { get; set; }

        //public ulong? ModelId { get; set; } = null;  // foreign key for future work
        public string Model { get; set; }

        public List<string>? Images { get; set; } = null;

        public string Manufacturer { get; set; }
        
        [DataType(DataType.Date)]
        public DateTime? CreationDate { get; set; } = null;

        public string Description { get; set; }

        public ulong PosterId { get; set; }
        [JsonIgnore] public virtual User.User? Poster { get; set; } = null!;

        public ulong? BuyerId { get; set; }
        [JsonIgnore] public virtual User.User? Buyer { get; set; } = null;

        [DataType(DataType.Date)]
        public DateTime? BuyDate { get; set; }

        public string? StripeSessionId { get; set; } = null;
    }

    public enum Condition: byte {
        FactoryNew = 1,
        MinimalWear = 2,
        FieldTested = 3,
        WellWorn = 4,
        BattleScared = 5,
    } 
}