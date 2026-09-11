let articles = [];
let trends = [];
const app = document.querySelector("#app");

async function loadArticles() {
  app.innerHTML =
    '<div class="container empty"><p class="eyebrow">LOADING THE SIGNAL</p><h2>Fetching the latest stories...</h2></div>';
  try {
    const articleResponse = await fetch("/api/articles");
    if (!articleResponse.ok) throw new Error("Live news API request failed");
    const articleData = await articleResponse.json();
    articles = articleData.articles;
    trends = articleData.topics || [];
    if (!articles.length)
      throw new Error("The live news API returned no stories");
    route();
  } catch (error) {
    app.innerHTML =
      '<div class="container empty"><p class="eyebrow">LIVE NEWS UNAVAILABLE</p><h2>We could not load the latest stories.</h2><p>Check the NewsAPI key and the Express server, then try again.</p><button class="comment-form" onclick="loadArticles()">Try again</button></div>';
    console.error(error);
  }
}

function tag(category) {
  return `<span class="tag">${category}</span>`;
}
function meta(article) {
  return `<div class="meta"><span>${article.author}</span><span>|</span><span>${article.date}</span><span>|</span><span>${article.time}</span></div>`;
}
function saveButton(id) {
  return `<button class="save" data-save="${id}" aria-label="Save article">Save</button>`;
}
function newsCard(article) {
  return `<article class="news-card"><img src="${article.img}" alt="${article.title}" loading="lazy"><div><div class="card-top">${tag(article.cat)}${saveButton(article.id)}</div><h3><a href="#article/${article.id}">${article.title}</a></h3><p>${article.desc}</p>${meta(article)}</div></article>`;
}
function supportCard(article) {
  return `<article class="support-card"><img src="${article.img}" alt="" loading="lazy"><div>${tag(article.cat)}<h3><a href="#article/${article.id}">${article.title}</a></h3>${meta(article)}</div></article>`;
}
function trending() {
  return `<aside><div class="section-head"><h2>Trending now</h2><span class="eyebrow">LIVE</span></div><div class="trending">${trends.map((trend, index) => `<a class="trend-item" href="#article/${trend.id}"><span class="trend-number">${String(index + 1).padStart(2, "0")}</span><span><h3>${trend.title}</h3><span>${trend.reads || "Live source"}</span></span></a>`).join("")}</div></aside>`;
}
function miniSection(category) {
  const list = articles
    .filter((article) => article.cat === category)
    .slice(0, 2);
  return list.length
    ? `<section class="mini-section"><div class="section-head"><h2>${category}</h2><a class="view-all" href="#category/${category}">See all</a></div>${list.map((article) => `<article class="mini-article"><img src="${article.img}" alt="" loading="lazy"><div><h3><a href="#article/${article.id}">${article.title}</a></h3><small>${article.date} | ${article.time}</small></div></article>`).join("")}</section>`
    : "";
}
function newsletter() {
  return `<section class="newsletter"><div><span class="eyebrow">THE PULSE LETTER</span><h2>One smart email. Zero noise.</h2></div><form class="newsletter-form" id="newsletterForm"><input type="email" placeholder="Your email address" required><button type="submit">Subscribe</button></form></section>`;
}
function home() {
  const [featured, ...rest] = articles;
  app.innerHTML = `<section class="hero container"><div class="hero-intro"><div><h1>Technology,<br><em>decoded.</em></h1></div><span class="date-stamp">${featured.date}</span></div><div class="feature-grid"><article class="feature-card"><img src="${featured.img}" alt="${featured.title}"><div class="feature-copy">${tag(featured.cat)}<h2><a href="#article/${featured.id}">${featured.title}</a></h2><p>${featured.desc}</p>${meta(featured)}</div></article><div class="supporting">${rest.slice(0, 3).map(supportCard).join("")}</div></div></section><div class="container content-layout"><section class="latest"><div class="section-head"><h2>Latest news</h2><a class="view-all" href="#latest">View all</a></div><div class="latest-grid">${articles.slice(1, 6).map(newsCard).join("")}</div></section>${trending()}</div><section class="category-strip"><div class="container"><div class="section-head"><h2>Explore the beat</h2><span class="eyebrow">BY CATEGORY</span></div><div class="category-grid">${["AI", "Programming", "Software", "Cybersecurity", "Gadgets", "Startups"].map(miniSection).join("")}</div></div></section><div class="container">${newsletter()}</div>`;
}
function articlePage(id) {
  const article = articles.find((item) => item.id === Number(id));
  if (!article) return searchPage();
  app.innerHTML = `<article class="article-page"><div class="container"><header class="article-header">${tag(article.cat)}<h1>${article.title}</h1><p class="article-deck">${article.desc}</p><div class="article-meta"><strong>${article.author}</strong><span>|</span><span>${article.date}</span><span>|</span><span>${article.time}</span><button class="save" data-save="${article.id}" aria-label="Save article">Save</button></div></header><img class="article-hero" src="${article.img}" alt="${article.title}"><div class="article-body"><div class="article-copy"><p>${article.desc}</p><a class="view-all" href="${article.url}" target="_blank" rel="noopener noreferrer">Read the full story at ${article.source || "the original source"}</a></div></div></div></article>`;
}
function searchPage(query = "", category = "") {
  const filtered = articles.filter(
    (article) =>
      (!query ||
        `${article.title} ${article.desc} ${article.cat}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!category || article.cat === category),
  );
  app.innerHTML = `<section class="hero container"><div class="hero-intro"><div><span class="eyebrow">${category ? "CATEGORY" : "SEARCH RESULTS"}</span><h1>${category || "Search the signal."}</h1></div><span class="date-stamp">${filtered.length} STORIES FOUND</span></div><div class="content-layout"><section class="latest"><div class="section-head"><h2>${query ? `Results for "${query}"` : `${category} stories`}</h2><span class="eyebrow">LIVE RESULTS</span></div><div class="latest-grid">${filtered.length ? filtered.map(newsCard).join("") : '<div class="empty"><h2>No stories found</h2><p>Try another keyword or browse a category.</p></div>'}</div></section>${trending()}</div></section>`;
}
function route() {
  if (!articles.length) return;
  const hash = location.hash.slice(1) || "home";
  if (hash.startsWith("article/")) articlePage(hash.split("/")[1]);
  else if (hash.startsWith("category/"))
    searchPage("", decodeURIComponent(hash.split("/")[1]));
  else if (hash.startsWith("search/"))
    searchPage(decodeURIComponent(hash.slice(7)));
  else if (hash === "latest") searchPage("");
  else home();
  document
    .querySelectorAll("[data-route]")
    .forEach((item) =>
      item.classList.toggle(
        "active",
        item.dataset.route === hash.split("/")[1] ||
          item.dataset.route === hash,
      ),
    );
}
function toast(message) {
  const element = document.querySelector("#toast");
  element.textContent = message;
  element.classList.add("show");
  setTimeout(() => element.classList.remove("show"), 2200);
}

document.addEventListener("click", (event) => {
  const save = event.target.closest("[data-save]");
  if (save) {
    save.classList.toggle("saved");
    save.textContent = save.classList.contains("saved") ? "Saved" : "Save";
    toast(
      save.classList.contains("saved")
        ? "Article saved to your reading list"
        : "Article removed from your reading list",
    );
  }
  if (event.target.closest("#menuToggle"))
    document.querySelector("#mobileNav").classList.toggle("open");
  if (event.target.closest("#searchToggle"))
    document.querySelector("#searchPanel").classList.add("open");
  if (event.target.closest("#closeSearch"))
    document.querySelector("#searchPanel").classList.remove("open");
});
document.addEventListener("submit", (event) => {
  if (event.target.matches("#newsletterForm,#footerForm")) {
    event.preventDefault();
    event.target.reset();
    toast("You are on the list. Welcome to the pulse.");
  }
});
document.querySelector("#themeToggle").onclick = () => {
  const dark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = dark ? "" : "dark";
  document.querySelector(".sun").style.display = dark ? "inline" : "none";
  document.querySelector(".moon").style.display = dark ? "none" : "inline";
};
document.querySelector("#searchInput").addEventListener("input", (event) => {
  if (event.target.value.length > 1) {
    location.hash = `search/${encodeURIComponent(event.target.value)}`;
    document.querySelector("#searchPanel").classList.remove("open");
  }
});
window.addEventListener("hashchange", route);
window.addEventListener("scroll", () => {
  const height = document.documentElement;
  document.querySelector("#progressBar").style.width =
    `${(height.scrollTop / (height.scrollHeight - height.clientHeight)) * 100}%`;
});
window.addEventListener("DOMContentLoaded", loadArticles);
