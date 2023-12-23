using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace sello.Models {
    public class Review {
        public Review(string title, string content, ulong reviewerId, ulong revieweeId) {
            this.Title = title;
            this.Content = content;
            this.ReviewerId = reviewerId;
            this.RevieweeId = revieweeId;
        }
        
        [Key]
        public ulong Id { get; set; }
        
        [MinLength(2)]
        [MaxLength(16)]
        public string Title { get; set; }
        
        [MinLength(5)]
        [MaxLength(255)]
        public string Content { get; set; }
        
        [DataType(DataType.Date)]
        public DateOnly PublishedOn { get; set; } 

        
        public ulong ReviewerId { get; set; }
        [JsonIgnore] public virtual User.User? Reviewer { get; set; } = null!;
        public ulong RevieweeId { get; set; }
        [JsonIgnore] public virtual User.User? Reviewee { get; set; } = null!;
    }
}