using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizGame.Data;
using QuizGame.Models;
using System.Security.Claims;

namespace QuizGame.Controllers
{
    [ApiController]
    [Route("api/quizzes")]
    public class QuizzesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizzesController(AppDbContext context)
        {
            _context = context;
        }

        // ================================
        // GET ACTIVE QUIZ STATUS
        // GET: api/quizzes/active
        // ================================
        [HttpGet("active")]
        public IActionResult GetActiveQuizStatus()
        {
            var quiz = _context.Quizzes
                .FirstOrDefault(q => q.IsActive);

            if (quiz == null)
                return Ok(new { hasQuiz = false });

            var now = DateTime.Now;

            var started = now >= quiz.StartAt;
            var ended = now > quiz.EndAt;

            var remainingSeconds = started && !ended
                ? (int)(quiz.StartAt
                        .AddMinutes(quiz.DurationMinutes) - now)
                        .TotalSeconds
                : 0;

            return Ok(new
            {
                hasQuiz = true,
                quiz.Id,
                quiz.Title,
                quiz.StartAt,
                quiz.DurationMinutes,
                started,
                ended,
                remainingSeconds
            });
        }
        [HttpGet("active/questions")]
        public IActionResult GetActiveQuizQuestions()
        {
            var quiz = _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefault(q => q.IsActive);

            if (quiz == null)
                return Ok(new { hasQuiz = false });

            var now = DateTime.Now;

            if (now < quiz.StartAt)
                return Ok(new
                {
                    hasQuiz = true,
                    started = false
                });

            if (now > quiz.StartAt.AddMinutes(quiz.DurationMinutes))
                return Ok(new
                {
                    hasQuiz = true,
                    ended = true
                });

            return Ok(new
            {
                hasQuiz = true,
                quiz.Id,
                quiz.Title,
                quiz.DurationMinutes,
                Questions = quiz.Questions.Select(q => new
                {
                    q.Id,
                    q.Text,
                    q.Type,
                    q.Points,
                    q.AllowImage,
                    Options = q.Type == QuestionType.MCQ
                        ? q.Options.Select(o => new
                        {
                            o.Id,
                            o.Text
                        })
                        : null
                })
            });
        }
        [Authorize]
        [HttpGet("{quizId}/completed")]
        public IActionResult IsQuizCompleted(int quizId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var totalQuestions = _context.Questions
                .Count(q => q.QuizId == quizId);

            var answeredQuestions = _context.Submissions
                .Count(s => s.QuizId == quizId && s.UserId == userId);

            return Ok(new
            {
                completed = totalQuestions > 0 && answeredQuestions >= totalQuestions,
                answeredQuestions,
                totalQuestions
            });
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult DeleteQuiz(int id)
        {
            var quiz = _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefault(q => q.Id == id);

            if (quiz == null)
                return NotFound();

            // ✅ 1) حذف كل Submissions المرتبطة بالكويز مباشرة
            var quizSubmissions = _context.Submissions
                .Where(s => s.QuizId == id)
                .ToList();
            _context.Submissions.RemoveRange(quizSubmissions);

            // ✅ 2) حذف Options
            var options = quiz.Questions
                .SelectMany(q => q.Options)
                .ToList();
            _context.Options.RemoveRange(options);

            // ✅ 3) حذف Questions
            _context.Questions.RemoveRange(quiz.Questions);

            // ✅ 4) حذف Quiz
            _context.Quizzes.Remove(quiz);

            _context.SaveChanges();

            return Ok();
        }

    }
}