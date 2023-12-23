using sello.Models.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using sello.Data;
using sello.Interface;


namespace sello.Controllers {
    
    [Route("api/token")]
    [ApiController]
    public class TokenController : ControllerBase {
        private readonly IConfiguration _Configuration;
        private readonly IUsers _Users;
        
        public TokenController(IConfiguration config, IUsers users) {
            _Configuration = config;
            _Users = users;
        }
        
        [HttpPost]
        public async Task<IActionResult> Post(Authenticate auth) {
            if (auth is not { Email: not null, Password: not null }) return BadRequest("Malformed input");
            var user = await _Users.GetUserAsyncByEmail(auth.Email);

            if (user == null) return BadRequest("Invalid credentials");
            
            if (!Hasher.PasswordVerify(user, auth.Password)) return BadRequest("Invalid credentials");
                
            //create claims details based on the user information
            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                //new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString()),
                new Claim("Id", user.Id.ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_Configuration["Jwt:Key"]));
            var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                _Configuration["Jwt:Issuer"],
                _Configuration["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: signIn
            );

            return Ok(new JwtSecurityTokenHandler().WriteToken(token));
        }
        
    }
}
