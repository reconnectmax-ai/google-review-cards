export default async function handler(req, res) {
  const { code } = req.query;

  const SUPABASE_URL = "https://qdnngscqagmkuzzttcyp.supabase.co";
  const SUPABASE_KEY = "sb_publishable_EPJFydcXiPVoXvj3kjSHQg_6YhDu3wz";

  if (!code) {
    return res.redirect(302, "/not-found.html");
  }

  try {
    const lookupRes = await fetch(
      `${SUPABASE_URL}/rest/v1/review_cards?code=eq.${encodeURIComponent(code)}&select=google_review_url,is_active,scan_count`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const rows = await lookupRes.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.redirect(302, "/not-found.html");
    }

    const card = rows[0];

    if (!card.is_active || !card.google_review_url) {
      return res.redirect(302, "/not-found.html");
    }

    fetch(`${SUPABASE_URL}/rest/v1/review_cards?code=eq.${encodeURIComponent(code)}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ scan_count: (card.scan_count || 0) + 1 })
    }).catch(() => {});

    return res.redirect(302, card.google_review_url);
  } catch (err) {
    return res.redirect(302, "/not-found.html");
  }
}
