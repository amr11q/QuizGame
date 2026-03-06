using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuizGame.Data;
using QuizGame.DTOs;
using QuizGame.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace QuizGame.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }
        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login(LoginDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Login data is missing");

                var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);

                if (user == null)
                    return Unauthorized("Invalid email or password");

                if (string.IsNullOrEmpty(user.PasswordHash))
                    return StatusCode(500, "User password hash is missing");

                bool passwordValid;

                try
                {
                    passwordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
                }
                catch
                {
                    return StatusCode(500, "Password verification failed");
                }

                if (!passwordValid)
                    return Unauthorized("Invalid email or password");

                // ================= JWT =================
                var jwtSettings = _config.GetSection("Jwt");

                var key = jwtSettings["Key"];
                var issuer = jwtSettings["Issuer"];
                var audience = jwtSettings["Audience"];

                if (string.IsNullOrWhiteSpace(key) ||
                    string.IsNullOrWhiteSpace(issuer) ||
                    string.IsNullOrWhiteSpace(audience))
                {
                    return StatusCode(500, "JWT settings missing");
                }

                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
                var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role ?? "User")
        };

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                return Ok(new
                {
                    token = tokenString,
                    role = user.Role
                });



            }
            catch (Exception ex)
            {
                // 👈 ده اللي هيكشف الخطأ الحقيقي
                return StatusCode(500, ex.Message);
            }
        }
        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = hashedPassword,
                Role = "User"   // ثابت
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("User created");
        }
        [HttpGet("today")]
            [Authorize]
             IActionResult GetTodayQuiz()
            {
                var quiz = _context.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefault(q => q.IsActive);

                if (quiz == null)
                    return NotFound("No quiz available");

                // 👇👇 هنا بالظبط
                return Ok(new
                {
                    quiz.Id,
                    quiz.Title,
                    quiz.DurationMinutes,
                    quiz.Questions
                });
            }
        
    }
}