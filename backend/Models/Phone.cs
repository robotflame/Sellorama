using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace sello.Models {
    public class Phone {
        public Phone(string creator, string name) {
            Creator = creator;
            Name = name;
        }
        
        public ulong Id { get; set; }
        public string Creator { get; set; }
        public string Name { get; set; }
    }
}