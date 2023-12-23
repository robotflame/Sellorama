using System.ComponentModel.DataAnnotations;
using sello.Interface;
using sello.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sello.Data;
using sello.Models;

namespace sello.Controllers {
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase {
        private readonly IMessages _Messages;
        private readonly IUsers _Users;
        
        public UserController(IUsers users, IMessages messages) {
            _Users = users;
            _Messages = messages;
        }
        
        [HttpGet] // GET: api/user
        public async Task<ActionResult<IEnumerable<User>>> Get() {
            return await Task.FromResult(await _Users.GetUsersAsync(""));
        }
        
        [HttpGet("{id}")] // GET api/user/(id)
        public async Task<ActionResult<User>> Get(ulong id) {
            var employees = await Task.FromResult(await _Users.GetUserAsync(id, ""));
            if (employees == null)
                return NotFound();
            
            return employees;
        }
        
        [HttpPost] // POST api/user
        public async Task<ActionResult<User>> Post(Register register) {
            var email = new EmailAddressAttribute();
            if (!email.IsValid(register.Email)) return BadRequest("Missing valid email!");
            
            var (hashedpassword, salt) = Hasher.PasswordHash(register.Password);
            var user = new User(register, hashedpassword, salt, false);
                        
            await _Users.AddUserAsync(user);
            return await Task.FromResult(user);
        }
        
        [Authorize]
        [HttpPut("{id}")] // PUT api/user/(id)
        public async Task<ActionResult<User>> Put(ulong id, User user) {
            var httpUser = HttpContext.User;
            var requestingUserIdClaim = httpUser.Claims.ToList().Find(c => c.Type == "Id");
            if (requestingUserIdClaim is null) 
                return BadRequest("Malformed Token");
            
            var requestingUserId = ulong.Parse(requestingUserIdClaim.Value);
            var requestingUser = await _Users.GetUserAsync(requestingUserId, "");
            if (requestingUser is null)
                return NotFound("Your user was not found");

            if (!user.IsAdmin || requestingUser.Id != id) return Unauthorized("You are not allowed to edit this user");
            
            try {
                await _Users.UpdateUserAsync(user);
            }
            catch (DbUpdateConcurrencyException) {
                if (!UserExists(id))
                    return NotFound();
                
                throw;
            }
            
            return await Task.FromResult(user);
        }
        
        [Authorize]
        [HttpDelete("{id}")] // DELETE api/user/(id)
        public async Task<ActionResult<User>> Delete(ulong id) {
            var httpUser = HttpContext.User;
            var requestingUserId = httpUser.Claims.ToList().Find(c => c.Type == "Id");
            if (requestingUserId is null) 
                return BadRequest("Malformed Token");

            var userId = ulong.Parse(requestingUserId.Value);
            var user = await _Users.GetUserAsync(userId, "");
            if (user is null)
                return NotFound("This user was not found");
            
            Console.WriteLine($"{user.Id} != {id} = {user.Id != id}");

            if (!user.IsAdmin && user.Id != id) 
                return Unauthorized("You are not allowed to delete this user");
            
            await _Users.DeleteUserAsync(id);
            return await Task.FromResult(user);
        }
        
        
        [HttpGet("listings/{userId}")] // GET api/user/listings/(id)
        public async Task<ActionResult<Listing[]>> GetListings(ulong userId) {
            var user = await _Users.GetUserAsync(userId, "Listings");
            if (user is null)
                return NotFound("This user was not found");

            var result = user.Listings.ToArray();
            
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("purchases/")] // GET api/user/purchases
        public async Task<ActionResult<Listing[]>> GetPurchases() {
            var httpUser = HttpContext.User;
            var requestingUserId = httpUser.Claims.ToList().Find(c => c.Type == "Id");
            if (requestingUserId is null) 
                return BadRequest("Malformed Token");

            var userId = ulong.Parse(requestingUserId.Value);
            var user = await _Users.GetUserAsync(userId, "Purchases");
            if (user is null)
                return NotFound("This user was not found");

            var result = user.Purchases.ToArray();
            
            return Ok(result);
        }
        
        [HttpGet("reviewees/{userId}")] // GET api/user/reviewees/(id)
        public async Task<ActionResult<Review[]>> GetReviewees(ulong userId) {
            var user = await _Users.GetUserAsync(userId, "Reviewees");
            if (user is null)
                return NotFound("This user was not found");

            var result = user.Reviewees.ToArray();
            
            return Ok(result);
        }
        
        [HttpGet("reviews/{userId}")] // GET api/user/reviews/(id)
        public async Task<ActionResult<Review[]>> GetReviews(ulong userId) {
            var user = await _Users.GetUserAsync(userId, "Reviews");
            if (user is null)
                return NotFound("This user was not found");

            var result = user.Reviews.ToArray();
            
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("chats/")] // GET api/user/chats
        public async Task<ActionResult<List<ulong>>> GetChats() {
            var httpUser = HttpContext.User;
            var requestingUserId = httpUser.Claims.ToList().Find(c => c.Type == "Id");
            if (requestingUserId is null) 
                return BadRequest("Malformed Token");

            var userId = ulong.Parse(requestingUserId.Value);
            var user = await _Users.GetUserAsync(userId, "");
            if (user is null)
                return NotFound("This user was not found");
            
            var result = _Messages.GetUniqueUsersChat(user);
            
            return Ok(result);
        }
        
        
        private bool UserExists(ulong id) {
            return _Users.HasUser(id);
        }
    }
}