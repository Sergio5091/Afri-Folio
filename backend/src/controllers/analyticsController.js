const pool = require("../config/db");

/**
 * GET /api/analytics
 * Statistiques de vues du portfolio de l'utilisateur connecté
 */
async function getAnalyticsStats(req, res, next) {
  try {
    const username = req.user.username;

    // Vues totales et ce mois
    const [totals] = await pool.query(
      `SELECT
        COUNT(*) AS totalViews,
        SUM(CASE WHEN viewed_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN 1 ELSE 0 END) AS viewsThisMonth
       FROM portfolio_views
       WHERE portfolio_username = ?`,
      [username]
    );

    // Vues par jour sur les 14 derniers jours
    const [byDay] = await pool.query(
      `SELECT
        DATE(viewed_at) AS date,
        COUNT(*) AS count
       FROM portfolio_views
       WHERE portfolio_username = ?
         AND viewed_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(viewed_at)
       ORDER BY date ASC`,
      [username]
    );

    // Construire un tableau complet des 14 derniers jours (même si count = 0)
    const viewsByDay = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = byDay.find((r) => {
        const rowDate = new Date(r.date).toISOString().split("T")[0];
        return rowDate === dateStr;
      });
      viewsByDay.push({ date: dateStr, count: found ? found.count : 0 });
    }

    // Vues par pays (top 5 + "Autres")
    const [byCountry] = await pool.query(
      `SELECT
        COALESCE(viewer_country, 'Inconnu') AS country,
        COUNT(*) AS count
       FROM portfolio_views
       WHERE portfolio_username = ?
       GROUP BY viewer_country
       ORDER BY count DESC
       LIMIT 5`,
      [username]
    );

    return res.json({
      totalViews: totals[0].totalViews || 0,
      viewsThisMonth: totals[0].viewsThisMonth || 0,
      viewsByDay,
      viewsByCountry: byCountry.map((r) => ({
        country: r.country,
        count: r.count,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalyticsStats };
