---
title: "Colophon"
navigation: false
date: 2025-11-19T13:14:03-0800
url: /colophon/
---
<h3>Purpose</h3>
<p>Saunter is my personal link log—Pinboard bookmarks flow into Micro.blog via the microintegrations middleware. This page collects the credits and moving pieces so future me (or another builder) knows what powers the site.</p>
<h3 id="platform--hosting">Platform &amp; Hosting</h3>
<ul>
<li><strong>Engine:</strong> <a href="https://gohugo.io">Hugo</a> compiled by Micro.blog. Each deploy renders the <code>Saunter</code> theme bundled in this repo.</li>
<li><strong>Hosting:</strong> Micro.blog serves the static site and handles media uploads.</li>
<li><strong>Automation:</strong> GitHub Actions in <code>microintegrations</code> run the Pinboard → Micro.blog sync every hour and commit state updates.</li>
</ul>
<h3 id="theme--front-end">Theme &amp; Front-end</h3>
<ul>
<li><strong>Theme:</strong> Custom <code>Saunter</code> theme (Fraunces for headings, Inter for body text, color palette inspired by the Wonky Editorial prototype).</li>
<li><strong>Components:</strong>
<ul>
<li>Timeline cards render full post content with category badges.</li>
<li>The <code>/seattle/</code> live cam pulls a fresh waterfront frame on each page load.</li>
<li>Light/dark toggle respects local time, OS preference, and manual overrides stored in <code>localStorage</code>.</li>
</ul>
</li>
<li><strong>Assets:</strong> Fonts from Google Fonts; icons are inline SVGs in the templates.</li>
</ul>
<h3 id="newsletter--forms">Newsletter &amp; Forms</h3>
<ul>
<li><strong>Provider:</strong> Mailchimp audience <code>f901f7d258</code>. The footer form posts directly to the Mailchimp endpoint with a honeypot field for bots.</li>
<li><strong>Search roadmap:</strong> <code>/search/</code> will embed Micro.blog’s user-scoped search results so readers stay on the site while searching the archives.</li>
</ul>
<h3 id="middleware">Middleware</h3>
<ul>
<li><strong>Repository:</strong> <a href="https://github.com/rocksoup/microintegrations"><code>github.com/rocksoup/microintegrations</code></a></li>
<li><strong>Scripts:</strong> <code>scripts/microblog-sync.mjs</code> orchestrates Pinboard RSS → Micropub posts. State lives in <code>.microblog-state.json</code> and is trimmed to 500 entries on save.</li>
<li><strong>Env Vars:</strong> <code>PINBOARD_MICROBLOG_FEED_URL</code>, <code>MICROBLOG_TOKEN</code>, <code>DRY_RUN</code>.</li>
</ul>
<h3 id="credits--thanks">Credits &amp; Thanks</h3>
<ul>
<li>Micro.blog for the platform and Micropub API.</li>
<li>Pinboard for the simple RSS feed powering the integration.</li>
<li>The Seattle waterfront cam for giving <code>/seattle/</code> a live skyline view.</li>
<li>Everyone filing issues in this repo—your notes shape the roadmap.</li>
</ul>
<p>If you notice something broken or want to borrow ideas, <a href="https://github.com/rocksoup/microintegrations/issues">open an issue</a> or ping me on Micro.blog (<code>@jfunk</code>).</p>

