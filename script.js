document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "619659e2cd0b47a4b2b1066e1bbcc80a";
  const apiUrl = "https://newsapi.org/v2/top-headlines";
  const proxy = "https://api.allorigins.win/raw?url=";
  const defaultCategory = "general";
  const newsContent = document.getElementById("news-content");

  // Detect localhost vs deployed origin
  const isLocal = 
    location.hostname === "localhost" || 
    location.hostname === "127.0.0.1";

  async function fetchNews(category) {
    try {
      const url = `${apiUrl}?category=${category}&language=en&apiKey=${apiKey}`;
      const fetchUrl = isLocal ? url : proxy + encodeURIComponent(url);
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.articles || [];
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

  // Chatbot toggle
  const chatTog = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  chatTog.addEventListener("click", () =>
    document.body.classList.toggle("show-chatbot")
  );
  closeBtn.addEventListener("click", () =>
    document.body.classList.remove("show-chatbot")
  );

  // Chat handling
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendBtn = document.querySelector(".send-btn");
  let userMessage = "";

  const createChatLi = (msg, cls) => {
    const li = document.createElement("li");
    li.classList.add("chat", cls);
    li.innerHTML =
      cls === "outgoing"
        ? `<p>${msg}</p>`
        : `<span class="material-symbols-outlined">smart_toy</span><p>${msg}</p>`;
    return li;
  };

  function generateResponse(chatEl) {
    chatEl.querySelector("p").textContent = "Thinking...";
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer YOUR_OPENAI_KEY`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      }),
    })
      .then(r => r.json())
      .then(data => {
        const resp = data.choices[0].message.content.trim();
        chatbox.appendChild(createChatLi(resp, "incoming"));
        chatbox.scrollTop = chatbox.scrollHeight;
      })
      .catch(() =>
        (chatEl.querySelector("p").textContent = "Oops! Something went wrong.")
      );
  }

  function handleChat() {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatInput.value = "";
    sendBtn.style.visibility = "hidden";
    setTimeout(() => {
      const placeholder = createChatLi("", "incoming");
      chatbox.appendChild(placeholder);
      generateResponse(placeholder);
    }, 600);
  }

  chatInput.addEventListener("input", () => {
    sendBtn.style.visibility = chatInput.value.trim() ? "visible" : "hidden";
  });
  sendBtn.addEventListener("click", handleChat);

  // Live date/time
  const dtEl = document.getElementById("dateTime");
  function updateTime() {
    dtEl.textContent = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  setInterval(updateTime, 1000);
  updateTime();
});