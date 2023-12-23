using System.Net;
using sello.Forms;
using sello.Interface;
using sello.Models.User;
using sello.Models;

namespace sello.Data {
    public static class DatabaseInitializer {
        public static void Initialize(DatabaseContext db, IImageStorage _Images) {
            // Delete the database before we initialize it. This is common to do during development.
            db.Database.EnsureDeleted();
            //_Images.DeleteAll();

            // Recreate the database and tables according to our models
            db.Database.EnsureCreated();

            // Add test data to simplify debugging and testing

            var user = new User("test", "test@gmail.com", "test123", DateTime.Now, true);
            (user.Password, user.Salt) = Hasher.PasswordHash(user.Password);
            db.Users.Add(user);
            
            user = new User("user", "user@example.com", "string", DateTime.Now, false);
            (user.Password, user.Salt) = Hasher.PasswordHash(user.Password);
            db.Users.Add(user);

            var phonesToAdd = new List<Phone>
            {
                new Phone("Apple", "iPhone 11"),
                new Phone("Apple", "iPhone 12"),
                new Phone("Samsung", "Galaxy S21"),
                new Phone("Samsung", "Galaxy S22"),
            };

            var messagestoadd = new List<Message>
            {
                new Message { Id = 1, ReceivingId = 2, SendingId = 1, Content = "Hello", Timestamp = DateTime.Now },
                 new Message { Id = 2, ReceivingId = 1, SendingId = 2, Content = "Hello", Timestamp = DateTime.Now },
            };
            
             db.AddRange(messagestoadd);
            
            db.SaveChanges();
            db.AddRange(phonesToAdd);
            
            db.SaveChanges();
            Random r = new Random();
            for (int x = 0; x < 20; x++) {
                var listingsToAdd = new List<Listing> {
                    Task.Run(() => DummyListing(_Images,1,new ListingPostForm(r.Next(100, 1000)*1000, (Condition)r.Next(1, 5), (String)phonesToAdd[0].Name.Clone(), (String)phonesToAdd[0].Creator.Clone(), "Buy it now!!!"), "https://www.mytrendyphone.no/images/iPhone-11-64GB-White-Used-20092022-01-p.webp")).Result,
                    Task.Run(() => DummyListing(_Images, 2, new ListingPostForm(r.Next(100, 1000)*1000, (Condition)r.Next(1, 5), (String)phonesToAdd[2].Name.Clone(), (String)phonesToAdd[2].Creator.Clone(), "Need a new phone"), "https://i.ebayimg.com/images/g/NskAAOSwIFVjyXfZ/s-l1200.webp")).Result,
                    Task.Run(() => DummyListing(_Images, 2, new ListingPostForm(r.Next(100, 1000)*1000, (Condition)r.Next(1, 5), (String)phonesToAdd[3].Name.Clone(), (String)phonesToAdd[3].Creator.Clone(), ":/"), "https://c02.purpledshub.com/uploads/sites/41/2022/05/S22-Ultra-small-560858c.jpg?w=1029&webp=1")).Result,
                    Task.Run(() => DummyListing(_Images,2,new ListingPostForm(r.Next(100, 1000)*1000, (Condition)r.Next(1, 5), (String)phonesToAdd[1].Name.Clone(), (String)phonesToAdd[1].Creator.Clone(), "Veldig tung og kul iphon"), "https://www.mytrendyphone.no/images/iPhone-12-128GB-Black-0194252031315-26102020-01-p.webp")).Result,
                    Task.Run(() => DummyListing(_Images,2,new ListingPostForm(r.Next(50, 250)*1000, Condition.WellWorn, (String)phonesToAdd[1].Name.Clone(), (String)phonesToAdd[1].Creator.Clone(), "Only a little cracked :)"), "https://www.cnet.com/a/img/resize/c4a28b4fb1fbb1f3495b89f2cce867d84fd45f0f/hub/2015/03/24/6b669dc2-96be-4f66-92c1-675fe31e162b/unnamed.jpg?auto=webp&fit=crop&height=1200&width=1200")).Result,
                    Task.Run(() => DummyListing(_Images,2,new ListingPostForm(r.Next(100, 1000), Condition.BattleScared, (String)phonesToAdd[2].Name.Clone(), (String)phonesToAdd[2].Creator.Clone(), "The screen still works"), "https://i.ibb.co/bms8y8H/adlrl8pk8l411.webp")).Result,
                };
                db.AddRange(listingsToAdd);
            }

            // todo add fake listings

            // Finally save the added relationships
            db.SaveChanges();
        }

        static async Task<Listing> DummyListing(IImageStorage _Images, ulong poster, ListingPostForm data, string imgurl) {
            var imageIds = new List<string>();
            
            using (var client = new WebClient())
            {
                var content = client.DownloadData(imgurl);
                using (var stream = new MemoryStream(content))
                {
                    var imageId = $"{Guid.NewGuid().ToString()}.webp";
                    var _ = await _Images.AddImageStreamAsync(stream, imageId);
                    imageIds.Add(imageId);
                }
            }   

            var listing = new Listing(data);
            listing.Images = imageIds;
            listing.PosterId = poster;
            listing.CreationDate = DateTime.Now;

            return listing;
        } 
    }
}