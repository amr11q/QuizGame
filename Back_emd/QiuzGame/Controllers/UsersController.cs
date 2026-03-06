using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizGame.Data;
using QuizGame.DTOs;
using QuizGame.Models;
using System.Linq;
using System.Security.Claims;

namespace QuizGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {

        [Authorize(Roles = "Admin")]
[HttpGet("leaderboard/all")]
        public IActionResult GetLeaderboard1()
        {
            var topUsers = _context.Users
                .OrderByDescending(u => u.TotalPoints)
                .Take(10)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.TotalPoints
                })
                .ToList();

            return Ok(topUsers);
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetMyProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var user = _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Name,
                    u.Email,
                    u.TotalPoints,
                    u.WeeklyPoints
                })
                .FirstOrDefault();

            return Ok(user);
        }

        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }



        // =========================
        // POST: api/users/register
        // تسجيل مستخدم جديد
        // =========================
        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            if (_context.Users.Any(u => u.Email == dto.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "User",
                TotalPoints = 0,
                WeeklyPoints = 0
            };
            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.Role
            });
        }

        // =========================
        // GET: api/users/leaderboard
        // أفضل 10 مستخدمين أسبوعيًا
        // =========================
        [HttpGet("leaderboard/leader")]
        public IActionResult GetLeaderboard()
        {
            var topUsers = _context.Users
                .OrderByDescending(u => u.WeeklyPoints)
                .Take(10)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.WeeklyPoints
                })
                .ToList();

            return Ok(topUsers);


        }

        // GET: api/users/weekly-winner
        [HttpGet("weekly-winner")]
        public IActionResult GetWeeklyWinner()
        {
            var winner = _context.Users
                .OrderByDescending(u => u.WeeklyPoints)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.WeeklyPoints,
                    u.TotalPoints
                })
                .FirstOrDefault();

            if (winner == null || winner.WeeklyPoints == 0)
                return NotFound("No weekly winner yet");

            return Ok(winner);
        }

    }

}
