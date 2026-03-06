using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizGame.Data;
using QuizGame.DTOs;
using QuizGame.Models;
using System.Security.Claims;

namespace QuizGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubmissionsController(AppDbContext context)
        {
            _context = context;
        }

        // ===============================
        // Admin - Get all submissions
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public IActionResult GetAllSubmissions()
        {
            var submissions = _context.Submissions
                .Include(s => s.User)
                .Include(s => s.Quiz)
                .Select(s => new
                {
                    s.Id,
                    UserName = s.User.Name,
                    QuizTitle = s.Quiz.Title,
                    s.AnswerText,
                    s.ImagePath,
                    s.Score,
                    s.EarnedPoints,
                    s.SubmittedAt
                })
                .ToList();

            return Ok(submissions);
        }

        // ===============================
        // Admin - Correct submission
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpPost("correct/{submissionId}/{score}")]
        public IActionResult CorrectSubmission(int submissionId, int score)
        {
            var submission = _context.Submissions
                .Include(s => s.User)
                .FirstOrDefault(s => s.Id == submissionId);

            if (submission == null)
                return NotFound("Submission not found");

            if (submission.IsCorrected)
                return BadRequest("Already corrected");

            submission.Score = score;
            submission.EarnedPoints = score;
            submission.IsCorrected = true;

            if (score > 0)
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var user = _context.Users.First(u => u.Id == userId);

                user.TotalPoints += score;
                user.WeeklyPoints += score;
            }

            _context.SaveChanges();

            return Ok(new { message = "Submission corrected" });
        }
        // ===============================
        // Check if user submitted question
        // ===============================
        [Authorize(Roles = "User,Admin")]
        [HttpGet("has-submitted/{questionId}")]
        public IActionResult HasSubmitted(int questionId)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            var hasSubmitted = _context.Submissions
                .Any(s => s.UserId == userId && s.QuestionId == questionId);

            return Ok(new { hasSubmitted });
        }

        // ===============================
        // Submit single answer (Quiz.jsx)
        // ===============================
        [Authorize(Roles = "User,Admin")]
        [HttpPost("submit")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SubmitAnswer([FromForm] SubmitAnswerDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            var question = _context.Questions
                .Include(q => q.Options)
                .FirstOrDefault(q => q.Id == dto.QuestionId);

            if (question == null)
                return BadRequest("Question not found");
            // =========================
            // ✅ تصحيح السؤال (MCQ)
            // =========================
            int score = 0;

            if (question.Type == QuestionType.MCQ)
            {
                var selectedOption = question.Options
     .FirstOrDefault(o => o.Id == dto.SelectedOptionId);
                if (selectedOption != null && selectedOption.IsCorrect)
                {
                    score = question.Points;
                }
            }

            var quiz = _context.Quizzes.FirstOrDefault(q => q.Id == question.QuizId);
            if (quiz == null)
                return BadRequest("Quiz not found");

            // منع التكرار
            var exists = _context.Submissions.Any(s =>
                s.UserId == userId &&
                s.QuestionId == dto.QuestionId
            );

            if (exists)
                return BadRequest("Already submitted");

            string? imagePath = null;
            if (dto.Image != null)
            {
                var uploads = Path.Combine("wwwroot", "uploads");
                Directory.CreateDirectory(uploads);

                var fileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                var path = Path.Combine(uploads, fileName);

                using var stream = new FileStream(path, FileMode.Create);
                await dto.Image.CopyToAsync(stream);

                imagePath = $"/uploads/{fileName}";
            }

            var submission = new Submission
            {
                UserId = userId,
                QuizId = quiz.Id,
                QuestionId = dto.QuestionId,
                SelectedOptionId = dto.SelectedOptionId,
                AnswerText = dto.AnswerText,
                ImagePath = imagePath,
                Score = score
            };

            if (question.Type == QuestionType.MCQ)
            {
                submission.IsCorrected = true;

                var correctOption = question.Options
                    .FirstOrDefault(o => o.IsCorrect);

                if (correctOption != null && dto.SelectedOptionId == correctOption.Id)
                {
                    submission.Score = question.Points;
                    submission.EarnedPoints = question.Points;

                    var user = _context.Users.First(u => u.Id == userId);
                    user.TotalPoints += question.Points;
                }
            }

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            return Ok("Answer submitted");
        }

        // ======================================================
        // ⭐ Submit full exam (Exam.jsx)
        // ======================================================
        [Authorize(Roles = "User,Admin")]
        [HttpPost("submit-exam")]
        public IActionResult SubmitExam([FromBody] SubmitExamDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            // منع حل الامتحان مرتين
            var alreadySolved = _context.Submissions
                .Any(s => s.QuizId == dto.QuizId && s.UserId == userId);

            if (alreadySolved)
                return BadRequest("You already submitted this exam");

            // جلب المستخدم مرة واحدة فقط
            var user = _context.Users.First(u => u.Id == userId);

            foreach (var ans in dto.Answers)
            {
                var question = _context.Questions
                    .Include(q => q.Options)
                    .FirstOrDefault(q => q.Id == ans.QuestionId);

                if (question == null)
                    continue;

                int score = 0;

                // تصحيح سؤال الاختيارات
                if (question.Type == QuestionType.MCQ)
                {
                    var correct = question.Options
                        .FirstOrDefault(o => o.IsCorrect);

                    if (correct != null && correct.Id == ans.SelectedOptionId)
                        score = question.Points;
                }

                // حفظ الإجابة
                _context.Submissions.Add(new Submission
                {
                    UserId = userId,
                    QuizId = dto.QuizId,
                    QuestionId = ans.QuestionId,
                    SelectedOptionId = ans.SelectedOptionId,
                    Score = score,
                    EarnedPoints = score,
                    IsCorrected = true,
                    SubmittedAt = DateTime.Now
                });

                // إضافة النقاط للمستخدم
                if (score > 0)
                {
                    user.TotalPoints += score;
                    user.WeeklyPoints += score;
                }
            }

            _context.SaveChanges();

            return Ok(new
            {
                message = "Exam submitted successfully"
            });
        }

        // ===============================
        // Admin - pending submissions
        // ===============================
        [Authorize(Roles = "Admin")]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingEssaySubmissions()
        {
            var submissions = await _context.Submissions
                .Where(s => !s.IsCorrected && s.AnswerText != null)
                .Include(s => s.User)
                .Include(s => s.Quiz)
                .Include(s => s.Question)
                .Select(s => new EssaySubmissionDto
                {
                    Id = s.Id,

                    QuizId = s.QuizId,
                    QuizTitle = s.Quiz.Title,

                    UserId = s.UserId,
                    UserName = s.User.Name,

                    QuestionId = s.QuestionId,
                    QuestionText = s.Question.Text,

                    AnswerText = s.AnswerText,
                    IsCorrected = s.IsCorrected
                })
                .ToListAsync();

            return Ok(submissions);
        }
    }

    // ===============================
    // DTOs
    // ===============================
    public class SubmitExamDto
    {
        public int QuizId { get; set; }
        public List<ExamAnswerDto> Answers { get; set; } = new();
    }

    public class ExamAnswerDto
    {
        public int QuestionId { get; set; }
        public int SelectedOptionId { get; set; }
    }
}