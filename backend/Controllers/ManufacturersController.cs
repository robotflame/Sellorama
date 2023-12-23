using sello.Models.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using sello.Data;
using sello.Models;


namespace sello.Controllers {


        [ApiController]
        [Route("api/manufacturers")]
        public class ManufacturersController: ControllerBase {
        private readonly DatabaseContext _context;

        public ManufacturersController(DatabaseContext context) {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetManufacturers() {
                var manufacturers = _context.Phones.Select(p => p.Creator).Distinct().ToList();
                return Ok(manufacturers);
            }


        [HttpPost("phones")]
        public IActionResult CreatePhone([FromBody] Phone phonedata) {
            if (phonedata == null) {
                return BadRequest("Invalid phone data.");
            }

            var phone = new Phone(phonedata.Creator,phonedata.Name);

            _context.Phones.Add(phone);
            _context.SaveChanges();

            return NoContent(); // Return a 204 No Content response to indicate successful creation.
        }



        [HttpGet("phones")]
        public IActionResult GetAllPhones() {
            var phones = _context.Phones.ToList();
            return Ok(phones);
        }

        [HttpGet("{manufacturer}/models")]
        public IActionResult GetModelsByManufacturer(string manufacturer) {
                // Retrieve models based on the selected manufacturer
                var models = _context.Phones
                    .Where(p => p.Creator == manufacturer)
                    .Select(p => p.Name)
                    .Distinct()
                    .ToList();

                return Ok(models);
            }
        [HttpDelete("phones/{id}")]
        public IActionResult DeletePhoneById(ulong id) {
            var phone = _context.Phones.FirstOrDefault(p => p.Id == id);
            if (phone == null) {
                return NotFound();
            }

            _context.Phones.Remove(phone);
            _context.SaveChanges();

            return NoContent();
        }



    }
}