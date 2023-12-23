using System.ComponentModel.DataAnnotations;
using sello.Interface;
using sello.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sello.Data;
using sello.Models;

namespace sello.Controllers {
    [Route("api/review")]
    [ApiController]
    public class ReviewController : ControllerBase {
        
        private readonly IReviews _Reviews;
        
        public ReviewController(IReviews reviews) {
            _Reviews = reviews;
        }
        
        [HttpGet("{id}")] // GET api/review/(id)
        public async Task<ActionResult<Review>> Get(ulong id) {
            var review = await Task.FromResult(await _Reviews.GetReviewAync(id));
            if (review == null)
                return NotFound();

            return review;
        }
        
        [HttpGet("review")] // GET api/review/review
        public List<Review> GetReview(User user) {
            return user.Reviews.ToList();
        }
        
        [HttpGet("reviewee")] // GET api/review/reviewee
        public List<Review> GetReviewee(User user) {
            return user.Reviewees.ToList();
        }
        
        [HttpPost] // Post api/review
        public async Task<ActionResult> Get([Bind("Title, Content, ReviewerId, RevieweeId")]Review review) {
            // TODO verify or some logic here
            review.PublishedOn = DateOnly.FromDateTime(DateTime.Now);
            await _Reviews.AddReviewAsync(review);
            return Ok();
        }
    }
}