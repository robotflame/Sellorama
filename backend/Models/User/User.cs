using sello.Models;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace sello.Models.User {
    public class User {

        public User() {}
        
        public User(string username, string email, string password, DateTime creation) {
            Username = username;
            Email = email;
            Password = password;
            CreationDate = creation;
        }
        public User(string username, string email, string password, DateTime creation, bool isAdmin) {
            Username = username;
            Email = email;
            Password = password;
            CreationDate = creation;
            IsAdmin = isAdmin;
        }
        
        public User(Register register, string password, byte[] Salt, bool isAdmin) {
            Username = register.Username;
            Email = register.Email;
            Password = password;
            this.Salt = Salt;
            CreationDate = DateTime.Now;
            IsAdmin = isAdmin;
        }
        
        [Key]
        public ulong Id { get; set; }
        
        [Required]
        [MinLength(3)]
        [MaxLength(24)]
        [DisplayName("Username")]
        public string Username { get; set; }
        
        [MinLength(6)]
        [MaxLength(255)]
        [EmailAddress]
        [DisplayName("Email")]
        public string Email { get; set; }
        
        [StringLength(24)]
        [DisplayName("Password")]
        [JsonIgnore]
        public string Password { get; set; }

        [DataType(DataType.Date)]
        public DateTime CreationDate { get; set; }

        public bool IsAdmin { get; set; }

        [JsonIgnore] 
        [MaxLength(16)]
        public byte[] Salt { get; set; } = new byte[16];
        
        // Relationships
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Review> Reviewees { get; set; } = new List<Review>();
        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
        public ICollection<Listing> Purchases { get; set; } = new List<Listing>();
    }
}