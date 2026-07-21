// api/r/[code].js
// Redirects a tapped NFC card straight to the Google "write a review" screen
// using the policy-compliant format (skips the profile page, no pre-filled stars).

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-side only, never exposed to client
);

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.redirect(302, '/not-found.html');
  }

  // NOTE: adjust table/column names below to match your actual Supabase schema.
  // Recommended schema: review_cards(code text, place_id text, business_name text, active boolean)
  const { data, error } = await supabase
    .from('review_cards')
    .select('place_id, active')
    .eq('code', code)
    .single();

  if (error || !data || !data.place_id) {
    // Card not activated yet, or code doesn't exist
    return res.redirect(302, `/not-found.html?code=${code}`);
  }

  if (!data.active) {
    return res.redirect(302, `/activate.html?code=${code}`);
  }

  // Compliant redirect: lands on the star-rating/write-review screen,
  // no profile page, no stars pre-filled — user picks their own rating.
  const reviewUrl = `https://search.google.com/local/writereview?placeid=${data.place_id}`;

  return res.redirect(302, reviewUrl);
}
