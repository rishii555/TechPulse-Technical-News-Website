require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const EXCLUDED_HEADLINE =
  "ecb rate hike will bring bad news for irish mortgage holders";
let latestArticles = [];

function categoryFor(article, requestedCategory) {
  if (requestedCategory) return requestedCategory;
  const text = `${article.title} ${article.description || ""}`.toLowerCase();
  if (
    text.includes("ai") ||
    text.includes("model") ||
    text.includes("artificial intelligence")
  )
    return "AI";
  if (
    text.includes("security") ||
    text.includes("hack") ||
    text.includes("vulnerability")
  )
    return "Cybersecurity";
  if (text.includes("startup") || text.includes("funding")) return "Startups";
  if (
    text.includes("laptop") ||
    text.includes("phone") ||
    text.includes("gpu") ||
    text.includes("device")
  )
    return "Gadgets";
  if (
    text.includes("javascript") ||
    text.includes("typescript") ||
    text.includes("programming") ||
    text.includes("developer")
  )
    return "Programming";
  return "Software";
}

async function fetchNewsApi(query, category) {
  if (!NEWS_API_KEY) throw new Error("NEWS_API_KEY is not configured");
  const search = query || category || "technology";
  const params = new URLSearchParams({
    q: search,
    language: "en",
    sortBy: "publishedAt",
    pageSize: "50",
    apiKey: NEWS_API_KEY,
  });
  const response = await fetch(`https://newsapi.org/v2/everything?${params}`);
  if (!response.ok) throw new Error(`NewsAPI returned ${response.status}`);
  const data = await response.json();
  return data.articles
    .filter((article) => article.title && article.urlToImage)
    .filter(
      (article) => article.title.toLowerCase().trim() !== EXCLUDED_HEADLINE,
    )
    .map((article, index) => ({
      id: 1000 + index,
      cat: categoryFor(article, category),
      title: article.title,
      desc:
        article.description ||
        "Open the source article for the latest details.",
      author: article.author || article.source?.name || "TechPulse desk",
      date: new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: `${Math.max(3, Math.ceil((article.content || article.description || "").split(/\s+/).length / 180))} min read`,
      img: article.urlToImage,
      url: article.url,
      source: article.source?.name,
      featured: index === 0,
    }));
}

function getTrending() {
  return latestArticles.slice(0, 5).map((article) => ({
    title: article.title,
    id: article.id,
    reads: article.source || article.author,
  }));
}

function filterArticles(source, query, category) {
  return source.filter((article) => {
    const matchesQuery =
      !query ||
      `${article.title} ${article.desc} ${article.cat}`
        .toLowerCase()
        .includes(query);
    const matchesCategory =
      !category || article.cat.toLowerCase() === category.toLowerCase();
    return matchesQuery && matchesCategory;
  });
}

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/articles", async (req, res) => {
  const query = String(req.query.search || "").toLowerCase();
  const category = String(req.query.category || "");
  try {
    latestArticles = await fetchNewsApi(query, category);
    const results = filterArticles(latestArticles, query, category);
    const topics = latestArticles.slice(0, 5).map((article) => ({
      title: article.title,
      id: article.id,
      reads: article.source || article.author,
    }));
    res.json({ articles: results, total: results.length, source: "newsapi", topics });
  } catch (error) {
    console.error(`NewsAPI unavailable: ${error.message}`);
    res.status(503).json({ error: "Live news is temporarily unavailable." });
  }
});

app.get("/api/articles/:id", (req, res) => {
  const article = latestArticles.find(
    (item) => item.id === Number(req.params.id),
  );
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});

app.get("/api/trending", (req, res) => {
  res.json({ topics: getTrending() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "techpulse-api" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TechPulse running at http://localhost:${PORT}`);
  });
}

module.exports = app;
