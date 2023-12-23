using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using Stripe;
using sello.Data;
using sello.Models; 
using sello.Models.Stripe;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
using sello.Interface;

namespace sello.Controllers
{
    [ApiController]
    [Route("api/stripe")]
    public class StripeController : ControllerBase {
        private readonly IUsers _Users;
        private readonly IListings _Listings;
        private readonly IConfiguration _configuration;

        public StripeController(IUsers users, IListings context, IConfiguration configuration) {
            _Users = users;
            _Listings = context;
            _configuration = configuration;
            StripeConfiguration.ApiKey = _configuration.GetSection("Stripe:SecretKey").Value;
        }

        [Authorize]
        [HttpPost("create-checkout-session")]
        public async Task<ActionResult> CreateCheckoutSession([FromBody] CheckoutSessionRequest request) {
        	var httpUser = HttpContext.User;
            var requestingUserId = httpUser.Claims.ToList().Find(c => c.Type == "Id");
            if (requestingUserId is null) 
                return BadRequest("Malformed Token");
            
            var userId = ulong.Parse(requestingUserId.Value);
            var user = await _Users.GetUserAsync(userId, "");
            if (user is null)
                return NotFound("This user was not found");
            
            var listing = await _Listings.GetListingAsync(request.ProductId);
            if (listing is null)
                return NotFound("Listing not found");
            
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = listing.Price, 
                            Currency = "nok",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "testin",
                                Description = "bestin",
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = request.SuccessUrl,
                CancelUrl = request.CancelUrl,
                Metadata = new Dictionary<string, string>() {
                    { "_listing_id", listing.Id.ToString()! },
                    { "_buyer_id", userId.ToString() } // TODO
                }
                
            };

            var service = new SessionService();
            Session session = await service.CreateAsync(options);

            return Ok(new { sessionId = session.Id });
        }
        
        [HttpPost("event")] // api/stripe/event
        public async Task<IActionResult> Index() {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            
            try {
                var stripeEvent = EventUtility.ParseEvent(json);

                // Handle the event
                switch (stripeEvent.Type) {
                    case Events.CheckoutSessionCompleted:
                        var session = stripeEvent.Data.Object as Session;
                        var listingId = ulong.Parse(session.Metadata["_listing_id"]);
                        var buyerId = ulong.Parse(session.Metadata["_buyer_id"]);
                        Console.WriteLine($"{buyerId} session to buy: {listingId}");
                        
                        var listing = await _Listings.GetListingAsync(listingId);
                        if (listing is null)
                            return NotFound("Listing not found");

                        var user = await _Users.GetUserAsync(buyerId, "");
                        if (user is null)
                            return NotFound("Buyer not found");

                        listing.BuyerId = user.Id;
                        listing.BuyDate = DateTime.Now;
                        listing.StripeSessionId = session.Id;
                        
                        await _Listings.UpdateListingAsync(listing);
                        
                        break;
                    default:
                        Console.WriteLine("Unhandled event type: {0}", stripeEvent.Type);
                        break;
                }
                return Ok();
            }
            catch (StripeException e)
            {
                return BadRequest();
            }
        }
    }

}
