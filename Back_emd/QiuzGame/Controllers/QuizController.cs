using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizGame.Data;
using QuizGame.Models;
using System.Security.Claims;

namespace QuizGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // ⬅️ أي مستخدم لازم يكون عامل Login
    public class QuizController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizController(AppDbContext context)
        {
            _context = context;
        }

        // =========================
        // Create new Quiz (Admin)
        // =========================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public IActionResult CreateQuiz([FromBody] CreateQuizDto dto)
        {
            var quiz = new Quiz
            {
                Title = dto.Title,
                QuizDate = dto.QuizDate.Date,
                StartAt = dto.StartAt,
                DurationMinutes = dto.DurationMinutes,
                IsActive = true
            };

            _context.Quizzes.Add(quiz);
            _context.SaveChanges();

            return Ok(new
            {
                quiz.Id,
                quiz.Title,
                quiz.QuizDate,
                quiz.StartAt,
                quiz.DurationMinutes
            });
        }

        // =========================
        // Get all quizzes (Admin)
        // =========================
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult GetAllQuizzes()
        {
            var quizzes = _context.Quizzes
                .Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.QuizDate,
                    q.StartAt,
                    q.DurationMinutes,
                    q.IsActive
                })
                .ToList();

            return Ok(quizzes);
        }

        // =========================
        // Get quiz result (User / Admin)
        // =========================
        [Authorize(Roles = "User,Admin")]
        [HttpGet("{quizId}/result")]
        public IActionResult GetQuizResult(int quizId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var quiz = _context.Quizzes.FirstOrDefault(q => q.Id == quizId);
            if (quiz == null)
                return NotFound("Quiz not found");

            var totalQuestions = _context.Questions.Count(q => q.QuizId == quizId);

            var submissions = _context.Submissions
                .Where(s => s.QuizId == quizId && s.UserId == userId)
                .ToList();

            return Ok(new
            {
                quizId,
                totalQuestions,
                answeredQuestions = submissions.Count,
                totalScore = submissions.Sum(s => s.Score),
                isCompleted = submissions.Count >= totalQuestions
            });
        }

        // =========================
        // Delete quiz (Admin)
        // =========================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{quizId}")]
        public IActionResult DeleteQuiz(int quizId)
        {
            var quiz = _context.Quizzes.FirstOrDefault(q => q.Id == quizId);
            if (quiz == null)
                return NotFound("Quiz not found");

            _context.Quizzes.Remove(quiz);
            _context.SaveChanges();

            return Ok("Quiz deleted");
        }

        // =========================
        // Toggle quiz active (Admin)
        // =========================
        [Authorize(Roles = "Admin")]
        [HttpPut("{quizId}/toggle")]
        public IActionResult ToggleQuiz(int quizId)
        {
            var quiz = _context.Quizzes.FirstOrDefault(q => q.Id == quizId);
            if (quiz == null)
                return NotFound("Quiz not found");

            quiz.IsActive = !quiz.IsActive;
            _context.SaveChanges();

            return Ok(new
            {
                quiz.Id,
                quiz.IsActive
            });
        }

        // =========================
        // Check if quiz completed (User / Admin)
        // =========================
        [Authorize(Roles = "User,Admin")]
        [HttpGet("{quizId}/completed")]
        public IActionResult IsQuizCompleted(int quizId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var totalQuestions = _context.Questions.Count(q => q.QuizId == quizId);
            if (totalQuestions == 0)
                return Ok(new { completed = false });

            var answeredQuestions = _context.Submissions
                .Count(s => s.QuizId == quizId && s.UserId == userId);

            return Ok(new
            {
                completed = answeredQuestions >= totalQuestions
            });
        }

        [Authorize(Roles = "User,Admin")]
        [HttpGet("{quizId}/can-enter")]
        public IActionResult CanEnterQuiz(int quizId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            var solved = _context.Submissions
                .Any(s => s.QuizId == quizId && s.UserId == userId);

            return Ok(new { canEnter = !solved });
        }

        // =========================
        // Get available quizzes (User / Admin)
        // =========================
        [Authorize(Roles = "User,Admin")]
        [HttpGet("available")]
        public IActionResult GetAvailableQuizzes()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var quizzes = _context.Quizzes
                .Where(q => q.IsActive)
                .Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.QuizDate,
                    q.StartAt,
                    q.DurationMinutes,
                    isSolved = _context.Submissions.Any(s =>
                        s.QuizId == q.Id &&
                        s.UserId == userId
                    )
                })
                .OrderBy(q => q.StartAt)
                .ToList();

            return Ok(quizzes);
        }
    }

    // =========================
    // DTO
    // =========================
    public class CreateQuizDto
    {
        public string Title { get; set; } = string.Empty;
        public DateTime QuizDate { get; set; }
        public DateTime StartAt { get; set; }
        public int DurationMinutes { get; set; }
    }
}