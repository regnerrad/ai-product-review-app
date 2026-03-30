export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const response = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&limit=50&sort=relevance&restrict_sr=false&t=all`,
      {
        headers: {
          'User-Agent': 'FindoApp/1.0 (by /u/findo)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API responded with ${response.status}`);
    }

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    console.error('Reddit proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch Reddit data' });
  }
}