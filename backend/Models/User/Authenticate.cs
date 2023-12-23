using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace sello.Models.User {
    public class Authenticate {
        public Authenticate(string email, string password) {
            Email = email;
            Password = password;
        }
        
        [Required]
        [EmailAddress]
        [DisplayName("Email")]
        public string Email { get; set; }

        [Required]
        [DisplayName("Password")]
        public string Password { get; set; }
    }
}