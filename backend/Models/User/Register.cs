using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace sello.Models.User {
    public class Register {
        public Register(string username, string email, string password) {
            Username = username;
            Email = email;
            Password = password;
        }
        
        [Required]
        [MinLength(3)]
        [MaxLength(24)]
        [DisplayName("Username")]
        public string Username { get; set; }
        
        [Required]
        [MinLength(6)]
        [MaxLength(255)]
        [EmailAddress]
        [DisplayName("Email")]
        public string Email { get; set; }

        [Required]
        [MinLength(2)]
        [MaxLength(24)]
        [DisplayName("Password")]
        public string Password { get; set; }
    }
}