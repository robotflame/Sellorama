using sello.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNet.SignalR;
using Microsoft.Net.Http.Headers;
using sello.Data;
using sello.Forms;
using sello.Interface;
using sello.Models.User;
using System.Linq.Dynamic.Core;

namespace sello.Controllers
{
    [Route("api/listings")]
    [ApiController]
    public class ListingsController : ControllerBase {
        private readonly IListings _Listings;
        private readonly IUsers _Users;
        private readonly IImageStorage _Images;
        private readonly IConfiguration _Configuration;

        public ListingsController(IListings listings, IUsers users, IImageStorage images, IConfiguration configuration) {
            _Listings = listings;
            _Users = users;
            _Images = images;
            _Configuration = configuration;
        }
        
        [HttpGet("image/{name}")]
        public ActionResult GetListingImage(string name) {
            var stream = _Images.GetImageStream(name);
            if (stream != null)
                return File(stream, "image/webp");
                
            return NotFound();
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Listing>> CreateListing([FromForm]ListingPostForm listingsForm) { 
            var postingUser = await this.GetUser(HttpContext.User);
            if (postingUser is null)
                return BadRequest("User token is missing or malformed!");

            if (listingsForm.files.IsNullOrEmpty())
                return BadRequest("Need to upload at least one image!");

            var imageIds = new List<string>();
            foreach (var file in listingsForm.files) {
                // TODO VERIFY THAT TYPE IS ACTUALLY A WEBP
                var imageId = $"{Guid.NewGuid().ToString()}.webp";
                var _ = await _Images.AddImageStreamAsync(file.OpenReadStream(), imageId);
                imageIds.Add(imageId);
            }

            var listing = new Listing(listingsForm);
            listing.Images = imageIds;
            listing.PosterId = postingUser.Id;
            listing.CreationDate = DateTime.Now;

            await _Listings.AddListingAsync(listing);

             return Ok(listing);
        }

        [HttpGet]
        public async Task<ActionResult> GetListings([FromQuery]Query query) {
            IQueryable<Listing> listings = _Listings.AsQueryable();
            listings = await query.Apply(listings);
            return Ok(listings);
        }
        
        [HttpGet("page-count")]
        public async Task<ActionResult<long>> GetListingsPageCount([FromQuery]Query query) {
            IQueryable<Listing> listings = _Listings.AsQueryable();
            
            // TODO figure out how to not load everything into ram, and instead dynamicaly add to the query
            var result = (await listings.ToListAsync()).AsQueryable();
            
            if (query.Where != null)
                result = result.Where(query.Where);
            
            return result.LongCount() / query.PageSize;
        }
        
        [HttpGet("count")]
        public async Task<ActionResult<long>> GetListingsCount([FromQuery]Query query) {
            IQueryable<Listing> listings = _Listings.AsQueryable();
            
            // TODO figure out how to not load everything into ram, and instead dynamicaly add to the query
            var result = (await listings.ToListAsync()).AsQueryable();
            
            if (query.Where != null)
                result = result.Where(query.Where);
            
            return result.LongCount();
        }

        [Authorize]
        [HttpPut("{listingId}")] // PUT api/listings
        public async Task<ActionResult> PutListing(ulong listingId, [FromForm]ListingPutForm listingData) {
            var httpUser = HttpContext.User;
            var requestingUserId = httpUser.Claims.ToList().Find(c => c.Type == "Id");
            if (requestingUserId is null) 
                return BadRequest("Malformed Token");
            
            
            var userId = ulong.Parse(requestingUserId.Value);
            var user = await _Users.GetUserAsync(userId, "");
            if (user is null)
                return NotFound("Your user was not found");
            
            var listing = await _Listings.GetListingAsync(listingId);
            if (listing is null)
                return NotFound("This listing was not found");
            
            if (!user.IsAdmin || (user.Id != listing.PosterId))
                return Unauthorized("You are not allowed to edit this listing");
            
            listingData.Impose(listing);

            if (listingData.ImagesToDelete is { Length: > 0 }) {
                foreach (var toRemove in listingData.ImagesToDelete) {
                    if (toRemove is null)
                        continue;
                    
                    _Images.RemoveImage(toRemove);
                    var hereHeIs = listing.Images.Find(i => i.Equals(toRemove));
                    listing.Images.Remove(hereHeIs);
                }
            }

            if (listingData.files != null) {
                foreach (var file in listingData.files) {
                    // TODO VERIFY THAT TYPE IS ACTUALLY A WEBP
                    var imageId = $"{Guid.NewGuid().ToString()}.webp";
                    var _ = await _Images.AddImageStreamAsync(file.OpenReadStream(), imageId);
                    listing.Images ??= new List<string>();
                    listing.Images.Add(imageId);
                }
            }
            
            await _Listings.UpdateListingAsync(listing);
            return Ok();
        }

        
        [Authorize]
        [HttpDelete("{listingId}")] // DELETE api/listings/(id)
        public async Task<ActionResult<User>> DeleteListing(ulong listingId) {
            var httpUser = HttpContext.User;
            var requestingUserId = httpUser.Claims.ToList().Find(c => c.Type == "Id");
            if (requestingUserId is null) 
                return BadRequest("Malformed Token");

            var userId = ulong.Parse(requestingUserId.Value);
            var user = await _Users.GetUserAsync(userId, "");
            if (user is null)
                return NotFound("This user was not found");
            
            //Console.WriteLine($"{user.Id} != {listingId} = {user.Id != listingId}");

            var listing = await _Listings.GetListingAsync(listingId);
            if (listing is null)
                return NotFound("This listing was not found");

            if (!user.IsAdmin || (user.Id != listing.PosterId))
                return Unauthorized("You are not allowed to delete this listing");
            
            await _Listings.DeleteListingAsync(listing.Id.Value);
            return await Task.FromResult(user);
        }
        
        [HttpGet("condition/definition")]
        public ActionResult<(Condition, string)[]> GetConditions() {
            var conditions = new[] {
                (Condition.FactoryNew, "Factory new"),
                (Condition.MinimalWear, "Minimal wear"),
                (Condition.FieldTested, "Field tested"),
                (Condition.WellWorn, "Well worn"),
                (Condition.BattleScared, "Battle scared")
            };
            return Ok(conditions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Listing>> GetListingById(ulong id) {
            var listing = await _Listings.GetListingAsync(id);

            if (listing == null)
                return NotFound("Listing not found");

            return Ok(listing);
        }
        
        private async Task<User?> GetUser(ClaimsPrincipal? claims) {
            if (claims is null)
                return null; // TODO send error to client

            var userIdClaim = claims.Claims.ToList().Find(c => c.Type == "Id");
            if (userIdClaim is null)
                return null; // TODO send error to client

            var userId = ulong.Parse(userIdClaim.Value);
            var user = await _Users.GetUserAsync(userId, "");
            return user ?? null; // TODO send error to client
        }
    }
}