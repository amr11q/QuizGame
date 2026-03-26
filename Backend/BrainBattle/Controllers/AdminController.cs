using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizGame.Data;

namespace QuizGame.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public IActionResult AdminStats()
        {
            return Ok(new
            {
                users = _context.Users.Count(),
                quizzes = _context.Quizzes.Count(),
                questions = _context.Questions.Count(),
                submissions = _context.Submissions.Count()
            });
        }
    }

}
