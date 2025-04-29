document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "619659e2cd0b47a4b2b1066e1bbcc80a";
  const apiUrl = "https://newsapi.org/v2/top-headlines";
  const allOrigins = "https://api.allorigins.win/raw?url=";
  const codeTabs = "https://api.codetabs.com/v1/proxy?quest=";
  const defaultCategory = "general";
  const newsContent = document.getElementById("news-content");

  const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

  async function fetchWithProxy(proxyUrl, targetUrl) {
    const fullUrl = proxyUrl + encodeURIComponent(targetUrl);
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
    return res.json();
  }

  async function fetchNews(category) {
    const targetUrl = `${apiUrl}?category=${category}&language=en&apiKey=${apiKey}`;
    try {
      if (isLocal) {
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data.articles || [];
      }

      // Try primary proxy (AllOrigins)
      try {
        const data = await fetchWithProxy(allOrigins, targetUrl);
        return data.articles || [];
      } catch (err) {
        console.warn("AllOrigins proxy failed, falling back to CodeTabs", err);
      }

      // Fallback proxy (CodeTabs)
      try {
        const data = await fetchWithProxy(codeTabs, targetUrl);
        return data.articles || [];
      } catch (err) {
        console.error("Both proxies failed", err);
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return [];
    }
  }

  function displayNews(articles) {
    newsContent.innerHTML = "";
    if (!articles.length) {
      newsContent.innerHTML = "<p>No news articles available at this time.</p>";
      return;
    }
    articles.filter(a => a.urlToImage).forEach(article => {
      const el = document.createElement("article");
      el.innerHTML = `
        <div class="article-thumbnail">
          <img src="${article.urlToImage}" alt="" />
        </div>
        <div class="article-details">
          <h2>${article.title}</h2>
          <p>${article.description || ""}</p>
          <a href="${article.url}" target="_blank">Read more</a>
        </div>
      `;
      newsContent.appendChild(el);
    });
  }

  // Navigation setup
  const navLinks = document.querySelectorAll("nav a");
  document.getElementById("category-general").classList.add("active");
  fetchNews(defaultCategory).then(displayNews);
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const cat = link.id.replace("category-", "");
      fetchNews(cat).then(displayNews);
    });
  });

  // Chatbot toggle + handling + live time (unchanged)
});