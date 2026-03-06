using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizGame.Data;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeaderboardController(AppDbContext context)
    {
        _context = context;
    }

    // ================================
    // GLOBAL LEADERBOARD
    // ================================
    [HttpGet("global")]
    [AllowAnonymous]
    public IActionResult GlobalLeaderboard()
    {
        var leaders = _context.Users
     .OrderByDescending(u => u.TotalPoints)
     .Take(10)
     .Select(u => new
     {
         id = u.Id,
         name = u.Name,
         points = u.TotalPoints
     })
     .ToList();

        return Ok(leaders);
    }

    // ================================
    // TOP 10 ALL TIME
    // ================================
    

    // ================================
    // TOP 10 WEEKLY
    // ================================
    [HttpGet("weekly")]
    [AllowAnonymous]
    public IActionResult GetWeeklyTopUsers()
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

    // ================================
    // MY RANK
    // ================================
    [Authorize]
    [HttpGet("me")]
    public IActionResult MyRank()
    {
        var userId = int.Parse(User.FindFirst("id")!.Value);

        var orderedUsers = _context.Users
            .OrderByDescending(u => u.TotalPoints)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.TotalPoints
            })
            .ToList();

        var rank = orderedUsers.FindIndex(u => u.Id == userId) + 1;

        return Ok(new
        {
            rank,
            user = orderedUsers.First(u => u.Id == userId)
        });
    }

    // ================================
    // ADMIN - RESET WEEKLY
    // ================================
    [Authorize(Roles = "Admin")]
    [HttpPost("reset-weekly")]
    public IActionResult ResetWeeklyPoints()
    {
        var users = _context.Users.ToList();

        foreach (var user in users)
        {
            user.WeeklyPoints = 0;
        }

        _context.SaveChanges();

        return Ok("Weekly points reset successfully");
    }

    // ================================
    // TOP 10 (FOR FRONTEND)
    // ================================
    [AllowAnonymous]
    [HttpGet("top10")]
    public IActionResult GetTop10()
    {
        var top = _context.Users
     .OrderByDescending(u => u.TotalPoints)
     .Take(10)
     .Select(u => new
     {
         id = u.Id,
         name = u.Name,
         points = u.TotalPoints
     })
     .ToList();

        return Ok(top);
    }

    // ================================
    // ADMIN - RESET ALL POINTS
    // ================================
    [Authorize(Roles = "Admin")]
    [HttpPost("reset-points")]
    public IActionResult ResetPoints()
    {
        var users = _context.Users.ToList();

        foreach (var user in users)
        {
            user.TotalPoints = 0;
        }

        _context.SaveChanges();

        return Ok("Points reset successfully");
    }

    // ================================
    // MY STATS
    // ================================
    [Authorize]
    [HttpGet("my-stats")]
    public IActionResult GetMyStats()
    {
        var userId = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
        );

        var user = _context.Users.FirstOrDefault(x => x.Id == userId);

        if (user == null)
            return NotFound();

        var rank = _context.Users
            .OrderByDescending(u => u.TotalPoints)
            .ToList()
            .FindIndex(u => u.Id == userId) + 1;

        var attempts = _context.Submissions
            .Where(x => x.UserId == userId)
            .Select(x => x.QuizId)
            .Distinct()
            .Count();

        return Ok(new
        {
            attempts,
            bestRank = rank
        });
    }

    // ================================
    // WEEKLY WINNER
    // ================================
    [AllowAnonymous]
    
    [HttpGet("weekly-top3")]
    public IActionResult GetWeeklyTop3()
    {
        var winners = _context.Users
            .Where(u => u.WeeklyPoints > 0)
            .OrderByDescending(u => u.WeeklyPoints)
            .Take(3)
            .Select(u => new
            {
                id = u.Id,
                name = u.Name,
                weeklyPoints = u.WeeklyPoints,
                totalPoints = u.TotalPoints
            })
            .ToList();

        if (winners.Count == 0)
        {
            return Ok(new { message = "No weekly winners yet" });
        }

        return Ok(winners);
    }
}