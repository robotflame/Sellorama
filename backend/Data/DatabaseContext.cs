using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using sello.Models;
using sello.Models.User;
using sello.Models;

namespace sello.Data {
    public class DatabaseContext : DbContext {
        public DatabaseContext(DbContextOptions<DatabaseContext> options)
            : base(options) {}
        public DbSet<User> Users { get; set; }
        public DbSet<Phone> Phones { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<Review> Review { get; set; }
        public DbSet<Message> Messages { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);
            
            // REVIEWS
            modelBuilder.Entity<User>()
                .HasMany(u => u.Reviews)
                .WithOne(r => r.Reviewer)
                .HasForeignKey(r => r.ReviewerId)
                .IsRequired();
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.ReviewerId)
                .IsRequired();
            
            modelBuilder.Entity<User>()
                .HasMany(u => u.Reviewees)
                .WithOne(r => r.Reviewee)
                .HasForeignKey(r => r.RevieweeId).IsRequired();
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewee)
                .WithMany(u => u.Reviewees)
                .HasForeignKey(r => r.RevieweeId)
                .IsRequired();
            
            // LISTINGS
            modelBuilder.Entity<User>()
                .HasMany(u => u.Listings)
                .WithOne(l => l.Poster)
                .HasForeignKey(l => l.PosterId)
                .IsRequired();
            modelBuilder.Entity<Listing>()
                .HasOne<User>(l => l.Poster)
                .WithMany(u => u.Listings)
                .HasForeignKey(listing => listing.PosterId)
                .IsRequired();

            modelBuilder.Entity<User>()
                .HasMany(u => u.Purchases)
                .WithOne(l => l.Buyer)
                .HasForeignKey(l => l.BuyerId);
            modelBuilder.Entity<Listing>()
                .HasOne<User>(l => l.Buyer)
                .WithMany(u => u.Purchases)
                .HasForeignKey(listing => listing.BuyerId);
        }
    }
}