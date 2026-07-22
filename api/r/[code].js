export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.redirect(302, '/not-found.html');
  }
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.redirect(302, '/not-found.html');
  }
  try {
    const url = `${SUPABASE_URL}/rest/v1/review_cards?code=eq.${encodeURIComponent(code)}&select=google_review_url,is_active`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!response.ok) {
      return res.redirect(302, '/not-found.html');
    }
    const rows = await response.json();
    const card = rows[0];
    if (!card || !card.google_review_url) {
      return res.redirect(302, `/not-found.html?code=${code}`);
    }
    if (!card.is_active) {
      return res.redirect(302, `/aktifkan.html?code=${code}`);
    }
    let reviewUrl = card.google_review_url.trim();
    if (!reviewUrl.startsWith('http')) {
      reviewUrl = `https://search.google.com/local/writereview?placeid=${reviewUrl}`;
    }
    return res.redirect(302, reviewUrl);
  } catch (err) {
    return res.redirect(302, '/not-found.html');
  }
}
