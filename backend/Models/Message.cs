using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace sello.Models {
    public class Message {
        [Key]
        public ulong Id { get; set; }
        public ulong ReceivingId { get; set; }
        public ulong SendingId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
    }
}