const pool = require("../config/db");

const toDateKey = (d) => new Date(d).toISOString().split("T")[0];

/**
 * GET /api/analytics?days=7|14|30|90
 * Statistiques du portfolio de l'utilisateur connecté
 */
async function getAnalyticsStats(req, res, next) {
  try {
    const username = req.user.username;
    const days = [7, 14, 30, 90].includes(parseInt(req.query.days)) ? parseInt(req.query.days) : 30;

    const [[totals]] = await pool.query(
      `SELECT
        COUNT(*) AS totalViews,
        COALESCE(SUM(viewed_at >= DATE_FORMAT(NOW(), '%Y-%m-01')), 0) AS viewsThisMonth,
        COALESCE(SUM(viewed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)), 0) AS viewsInRange
       FROM portfolio_views WHERE portfolio_username = ?`,
      [days - 1, username]
    );

    const [byDay] = await pool.query(
      `SELECT DATE(viewed_at) AS date, COUNT(*) AS count
       FROM portfolio_views
       WHERE portfolio_username = ? AND viewed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(viewed_at)`,
      [username, days - 1]
    );
    const [clicksByDay] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM portfolio_events
       WHERE portfolio_username = ? AND type IN ('whatsapp','call','email')
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)`,
      [username, days - 1]
    );

    // Série complète (jours sans visite = 0)
    const viewsMap = new Map(byDay.map((r) => [toDateKey(r.date), Number(r.count)]));
    const clicksMap = new Map(clicksByDay.map((r) => [toDateKey(r.date), Number(r.count)]));
    const viewsByDay = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      viewsByDay.push({ date: key, count: viewsMap.get(key) || 0, contacts: clicksMap.get(key) || 0 });
    }

    const [byCountry] = await pool.query(
      `SELECT COALESCE(viewer_country, 'Inconnu') AS country, COUNT(*) AS count
       FROM portfolio_views
       WHERE portfolio_username = ? AND viewed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY viewer_country ORDER BY count DESC LIMIT 6`,
      [username, days - 1]
    );

    const [bySource] = await pool.query(
      `SELECT COALESCE(source, 'direct') AS source, COUNT(*) AS count
       FROM portfolio_views
       WHERE portfolio_username = ? AND viewed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY COALESCE(source, 'direct') ORDER BY count DESC`,
      [username, days - 1]
    );

    const [events] = await pool.query(
      `SELECT type, COUNT(*) AS count FROM portfolio_events
       WHERE portfolio_username = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY type`,
      [username, days - 1]
    );
    const eventCounts = Object.fromEntries(events.map((e) => [e.type, Number(e.count)]));

    return res.json({
      days,
      totalViews: Number(totals.totalViews) || 0,
      viewsThisMonth: Number(totals.viewsThisMonth) || 0,
      viewsInRange: Number(totals.viewsInRange) || 0,
      viewsByDay,
      viewsByCountry: byCountry.map((r) => ({ country: r.country, count: Number(r.count) })),
      viewsBySource: bySource.map((r) => ({ source: r.source, count: Number(r.count) })),
      events: {
        whatsapp: eventCounts.whatsapp || 0,
        call: eventCounts.call || 0,
        email: eventCounts.email || 0,
        share: eventCounts.share || 0,
        lead: eventCounts.lead || 0,
        vcard: eventCounts.vcard || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalyticsStats };
