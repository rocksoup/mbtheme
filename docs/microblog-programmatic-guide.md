# Interacting with Micro.blog Programmatically

This document summarizes how to create, edit, delete, and otherwise interact with posts and post‑like content on Micro.blog using its available APIs and tools. It’s written to be dropped directly into a repository (e.g. `docs/microblog-api.md`).

It covers:

- Authentication and tokens
- JSON API (timelines, posts, replies, bookmarks, books, notes, etc.)
- Micropub API for posting and editing content
- XML‑RPC / MetaWeblog API
- Feeds (RSS / JSONFeed)
- Third‑party tools and workflows
- Limitations and best‑practice notes

---

## 1. Authentication & Tokens

All Micro.blog APIs require authentication tied to a user account for any non‑public operations.

### 1.1 App tokens (Bearer tokens)

For most scripts and apps, you use an **App Token**:

- Go to your Micro.blog account → **Account → Edit Apps**.
- Create a new app token.
- Use that token in an HTTP header:

```http
Authorization: Bearer YOUR_APP_TOKEN_HERE
```

Characteristics:

- Tokens are long‑lived and effectively act as “API passwords”.
- Tokens can be revoked from the Micro.blog web UI.
- A single token can be reused across JSON, Micropub, and Notes APIs.

### 1.2 IndieAuth (OAuth‑style)

For web / mobile apps that need a sign‑in flow, Micro.blog supports **IndieAuth**, an OAuth‑like protocol:

High‑level flow:

1. Your app sends the user to Micro.blog’s IndieAuth authorization URL with parameters like `client_id`, `redirect_uri`, `scope` (e.g. `create`).
2. User signs in and approves the app.
3. Micro.blog redirects back to your `redirect_uri` with a temporary `code`.
4. Your app exchanges `code` for an access token at the token endpoint.
5. You then use that token as a Bearer token in all API requests.

Notes:

- Unlike classic OAuth, IndieAuth often doesn’t require a client secret.
- Scopes like `create` are used for Micropub posting. Other scopes may be used for read / media operations depending on your implementation.
- For simple personal tooling, app tokens are usually easier than implementing IndieAuth.

### 1.3 Email / temporary logins

Micro.blog also supports an email‑based login link flow for some client apps via special endpoints (e.g. `account/signin` and `account/verify`). This is primarily for official apps; for custom tooling you should prefer **App Tokens** or **IndieAuth**.

---

## 2. JSON API (REST‑style)

Micro.blog exposes a REST‑like JSON API. Most endpoints return data in **JSON Feed** format with per‑item Micro.blog extensions under a `_microblog` object.

Base URL (conceptually):

```text
https://micro.blog/
```

All authenticated requests include:

```http
Authorization: Bearer YOUR_APP_TOKEN
```

### 2.1 Timelines & post retrieval

**Main timeline (following):**

```http
GET /posts/timeline
```

- Returns posts from people the authenticated user follows.
- Response is a JSON Feed (`items` array with posts).

**Mentions:**

```http
GET /posts/mentions
```

- Posts that mention the authenticated user.

**Discover feed:**

```http
GET /posts/discover
```

- Curated posts featured in Micro.blog’s “Discover” section.
- Category variants like `/posts/discover/books`, `/posts/discover/music`, etc.

**User posts:**

```http
GET /posts/{username}
GET /posts/{username}/photos
```

- First endpoint: all posts from a given user.
- Second endpoint: photo‑only posts from that user.

**Conversation thread:**

```http
GET /posts/conversation?id={id}
```

- Returns the thread around a specific post ID (root + replies).

**Check for new posts (polling helper):**

```http
GET /posts/check?since_id={id}
```

- Returns whether there are new posts in the timeline after `since_id`.
- Also typically returns a recommended delay before polling again.

**Your own replies:**

```http
GET /posts/replies
```

- Replies authored by the authenticated user.

#### Pagination

Most list endpoints support some combination of:

- `count=` – number of items to return.
- `since_id=` – items *after* this ID.
- `before_id=` – items *before* this ID.

Post IDs are 64‑bit integers unique across posts / replies / bookmarks.

### 2.2 Post actions (reply, delete, bookmark)

**Create a reply:**

```http
POST /posts/reply
Content-Type: application/x-www-form-urlencoded

id={post_id}&content=Your+reply+text+here
```

- `id`: ID of the post you’re replying to.
- `content`: reply text (HTML or Markdown as supported by Micro.blog).

**Delete a post or bookmark:**

```http
DELETE /posts/{id}
```

- Deletes a post or reply created by the authenticated user.
- Also used for deleting bookmark entries (bookmarks are posts with special flags).

**Bookmark a post:**

```http
POST /posts/bookmarks
Content-Type: application/x-www-form-urlencoded

id={post_id}
```

**Remove a bookmark:**

```http
DELETE /posts/bookmarks/{id}
```

- The `id` is the bookmark’s ID; often this matches the original post’s ID in bookmark context.

### 2.3 Social graph: follow / mute / block

**Follow / unfollow:**

```http
POST /users/follow
POST /users/unfollow
```

Both accept form‑encoded `username` of the target user:

```http
username=someuser
```

**Is following:**

```http
GET /users/is_following?username={username}
```

**List following for a user:**

```http
GET /users/following/{username}
```

**Discover people to follow:**

```http
GET /users/discover/{username}
```

- Lists accounts followed by `{username}` that *you* do not yet follow.

**Pinned posts for a user:**

```http
GET /users/pins/{username}
```

**Mute / keyword filter:**

```http
POST /users/mute     # with username or keyword
GET  /users/muting   # list muted users
```

- To mute a user: send `username` in the body.
- To mute a keyword: send `keyword` in the body.

**Adjust mute settings:**

```http
POST   /users/muting/{mute_id}  # change options for a specific mute
DELETE /users/muting/{mute_id}  # unmute
```

Some settings include hiding replies to muted users to keep conversations clean.

**Block / unblock:**

```http
POST   /users/block
GET    /users/blocking
DELETE /users/blocking/{block_id}
```

- Blocks are stronger than mutes and prevent interaction in both directions.

### 2.4 Photos, media, push notifications

**Photo‑only and media timelines:**

```http
GET /posts/photos   # photo posts only
GET /posts/media    # photo + video posts
```

**Media upload:**

- There is *not* a separate JSON media upload endpoint.
- Media uploads use the **Micropub media endpoint** (see section 3.3).

**Push notification registration:**

```http
POST /users/push/register
```

- Used by mobile clients to register device tokens for push notifications.
- Parameters depend on platform (iOS/Android) and are typically only needed for full client apps.

### 2.5 Bookmarks API (saved links & highlights)

Micro.blog bookmarks are first‑class items with their own API.

**List bookmarks:**

```http
GET /posts/bookmarks
```

- Returns a JSON Feed of bookmarks.
- Each item includes source URL, title, internal IDs, and a `_microblog` block with extra info (e.g. flags, archival links).

**Filter bookmarks by tag:**

```http
GET /posts/bookmarks?tag={tag}
```

**List highlights across bookmarks:**

```http
GET /posts/bookmarks/highlights
```

- Returns recent text highlights collected from bookmarked pages.

**Bookmark reader view:**

```http
GET /hybrid/bookmarks/{link_id}
```

- HTML “reader” view for a bookmarked page (for use in webviews, highlighting, etc.).

**Get a single bookmark:**

```http
GET /posts/bookmarks/{id}
```

**List bookmark tags:**

```http
GET /posts/bookmarks/tags
# Optionally:
GET /posts/bookmarks/tags?recent=1&count=10
```

**Add / update bookmark tags:**

```http
POST /posts/bookmarks/{id}
Content-Type: application/x-www-form-urlencoded

tags=tag1,tag2,tag3
```

- Replaces existing tags with the provided list.

**Delete a highlight:**

```http
DELETE /posts/bookmarks/highlights/{highlight_id}
```

> Creating bookmarks for arbitrary URLs is usually done via **Micropub** using `bookmark-of` (see section 3.2).

### 2.6 Books API (bookshelves, reading goals)

Micro.blog includes a built‑in “books” system.

**List bookshelves:**

```http
GET /books/bookshelves
```

- Returns bookshelves (e.g. “Currently reading”, “Finished”).

**Books in a shelf:**

```http
GET /books/bookshelves/{id}
```

- Returns books in the specified shelf.

**Create / rename shelf:**

```http
POST /books/bookshelves            # create
POST /books/bookshelves/{id}       # rename

# body
name=New+Shelf+Name
```

**Add a book:**

```http
POST /books
```

Body (form‑encoded):

- `title` – book title
- `author` – author name
- `isbn` – (optional) ISBN
- `cover_url` – (optional) cover image URL
- `bookshelf_id` – (optional) shelf to add it to

**Assign / move book to shelf:**

```http
POST /books/bookshelves/{shelf_id}/assign

book_id={book_id}
```

**Remove book from shelf:**

```http
DELETE /books/bookshelves/{shelf_id}/remove/{book_id}
```

**Change book cover:**

```http
POST /books/bookshelves/{shelf_id}/cover/{book_id}

cover_url=https://example.com/new-cover.jpg
```

**Reading goals:**

```http
GET  /books/goals
GET  /books/goals/{id}
POST /books/goals/{id}
```

- `GET /books/goals` – list yearly reading goals.
- `GET /books/goals/{id}` – get progress for one goal.
- `POST /books/goals/{id}` – update:
  - `value` – target number of books
  - `progress` – current books read (usually auto‑updated when marking books as read).

> Book search by title/author is *not* provided by Micro.blog. Use an external service (Open Library, Google Books, etc.) to look up metadata/ISBNs.

### 2.7 Notes API (encrypted private notes)

Micro.blog’s **Notes** feature stores encrypted personal notes. The public blog cannot read your private note content unless you explicitly publish it.

**List notebooks:**

```http
GET /notes/notebooks
```

**List notes in a notebook:**

```http
GET /notes/notebooks/{id}
```

**Get a single note:**

```http
GET /notes/{id}
```

**Get note revision history:**

```http
GET /notes/{id}/versions
```

**Create / update notes:**

```http
POST /notes
```

Supported fields (form‑encoded):

- `notebook_id` – notebook to store the note in.
- `id` – existing note ID if updating.
- `text` – **encrypted** or plain text, depending on flags.
- `is_encrypted` – `true` if `text` is encrypted (typical for private notes).
- `is_sharing` – `true` to publish this note as a blog post.
- `is_unsharing` – `true` to unpublish a previously shared note.
- `attached_book_isbn` – optional ISBN to associate note with a book.

**Create / rename notebook:**

```http
POST /notes/notebooks

# new notebook
name=My+Notebook

# rename notebook
id={notebook_id}&name=New+Name
```

**Delete note / notebook:**

```http
DELETE /notes/{id}
DELETE /notes/notebooks/{id}
```

#### Notes encryption model

- Notes are encrypted **client‑side** using AES‑256‑GCM.
- Micro.blog stores ciphertext and cannot decrypt private notes.
- Each user has an **encryption key** (visible in the web UI) that apps must use to encrypt/decrypt.
- Shared notes (published to the blog) are stored and returned in plaintext for the published version, with extra fields like `shared_url`.

For most blog‑facing integrations you can ignore Notes. If you build a note‑taking client, you must implement the crypto correctly and handle keys safely.

### 2.8 Rate‑limiting expectations

Micro.blog does not publish strict numeric rate‑limits, but the expectations are:

- Poll timelines and feeds on a *reasonable* cadence (e.g. no more than once every 1–2 minutes for personal apps; less for global feeds).
- Use `/posts/check` to discover if there are new items before fetching full timelines.
- Avoid bulk delete / create loops without delays.

If you hit implicit limits, back off. Treat Micro.blog like a small platform rather than a big social network with large infra.

---

## 3. Micropub API (Primary posting interface)

Micro.blog’s preferred way to **create, edit, and delete posts** is via the **Micropub** standard (W3C). If you only need to post content (and not read timelines), **use Micropub**.

### 3.1 Endpoint & auth

Micropub endpoint:

```http
POST https://micro.blog/micropub
```

Generally:

- AUTH: `Authorization: Bearer YOUR_TOKEN`
- Body: `application/x-www-form-urlencoded` **or** `application/json`

Example: minimal text post:

```bash
curl -X POST "https://micro.blog/micropub"   -H "Authorization: Bearer YOUR_TOKEN"   -d "h=entry&content=Hello%20world."
```

Key points:

- `h=entry` identifies the Micropub object as an “entry” (post).
- Successful create returns HTTP 201 (or 202 in some cases) with a `Location` header pointing to the new post’s URL.

### 3.2 Creating posts (content types)

Micropub supports a variety of post types via properties:

#### 3.2.1 Plain text / short posts

```text
h=entry
content=This is a short microblog post.
```

- No `name` → treated as a short status/micro‑post.
- Micro.blog uses your blog’s default format (often Markdown or HTML with auto‑formatting).

#### 3.2.2 Articles (with title)

```text
h=entry
name=My First Blog Post
content=This is the body of the post...
```

- `name` becomes the post title.
- These often render as long‑form posts with their own pages (depending on theme/config).

#### 3.2.3 Replies

```text
h=entry
content=@alice I agree with your point.
in-reply-to=https://alice.micro.blog/12345
```

- `in-reply-to` holds the URL of the post being replied to.
- Micro.blog adds this into the conversation thread and can send Webmention to external sites if applicable.

#### 3.2.4 Bookmarks

To create a bookmark (and optionally save article content):

```text
h=entry
bookmark-of=https://example.com/great-article
content=Interesting article about technology...
```

Optional “save full content” property (if supported for your app):

```text
h=entry
bookmark-of=https://example.com/locked-article
bookmark-content=<html>...full original HTML...</html>
```

- Micro.blog archives the article and uses provided HTML when `bookmark-content` is present.
- Bookmark will show up in the Bookmarks API and UI, with highlight support.

#### 3.2.5 Likes & reposts

```text
h=entry
like-of=https://example.com/post
```

```text
h=entry
repost-of=https://example.com/post
content=My thoughts about this post...
```

- `like-of`: registers a “like” of a URL. For Micro.blog posts this behaves like a favorite / bookmark; for external posts, Webmention can be sent.
- `repost-of`: indicates you’re re‑sharing a URL. Micro.blog does **not** create social‑network‑style reblogs in the timeline; it treats reposts more like link posts, especially if you include your own `content` (quote‑post behavior).

#### 3.2.6 Drafts

```text
h=entry
content=This is a draft post.
post-status=draft
```

- Creates a draft instead of a published post.
- Response typically includes:
  - `url` – final permalink that will be used when published.
  - `preview` – private preview URL for the draft.

Publishing is usually done via the web UI or by updating the post via Micropub to remove `post-status=draft` (see 3.4).

### 3.3 Photo / media posts

Micropub uses a **media endpoint** for file uploads.

#### 3.3.1 Discover the media endpoint

```bash
curl "https://micro.blog/micropub?q=config"   -H "Authorization: Bearer YOUR_TOKEN"
```

Look for `media-endpoint` in the JSON response, typically:

```json
{
  "media-endpoint": "https://micro.blog/micropub/media",
  ...
}
```

#### 3.3.2 Upload media

```bash
curl -X POST "https://micro.blog/micropub/media"   -H "Authorization: Bearer YOUR_TOKEN"   -F "file=@photo.jpg"
```

- On success, Micro.blog returns **202 Accepted** with a `Location` header:
  - e.g. `Location: https://username.micro.blog/uploads/1234567890.jpg`
- The URL in `Location` is the final image URL you’ll use in posts.

#### 3.3.3 Create photo post with alt text

```bash
curl -X POST "https://micro.blog/micropub"   -H "Authorization: Bearer YOUR_TOKEN"   -d "h=entry"   -d "content=Sunset at the beach"   -d "photo=https://username.micro.blog/uploads/1234567890.jpg"   -d "mp-photo-alt=A beautiful sunset over the ocean."
```

Notes:

- You can repeat `photo=` to attach multiple images.
- You can repeat `mp-photo-alt` to supply alt text for each image (same ordering).

### 3.4 Editing & deleting posts (Micropub actions)

Micropub uses `action=` for non‑create operations.

#### 3.4.1 Update

Example (form‑encoded `action=update`):

```text
action=update
url=https://username.micro.blog/2025/12/03/hello-world.html
replace[content]=Hello, world (edited)!
```

- `url` – canonical URL of the post.
- `replace[...]`, `add[...]`, `delete[...]` – standard Micropub update syntax:
  - `replace[content]` – replace content value.
  - `add[category][]` – add categories, etc.
  - `delete[category][]` – remove categories, etc.

Micro.blog implements the core Micropub update behavior for content, title, etc. If you only know the post ID, first resolve its URL via the JSON API (timeline/feed item) and then use that URL in Micropub.

#### 3.4.2 Delete

```text
action=delete
url=https://username.micro.blog/2025/12/03/hello-world.html
```

- Deletes the specified post.
- Use carefully; there is no guaranteed undelete.

### 3.5 Micropub queries (`q=`)

Micropub also supports read‑side queries.

**Config / capabilities:**

```http
GET /micropub?q=config
```

Typical response includes:

- `media-endpoint` – uploading media.
- `destination` – list of blogs (for multi‑blog accounts).
- `syndicate-to` – list of cross‑posting targets (Twitter, Mastodon, etc.).

**List posts (source):**

```http
GET /micropub?q=source
```

- Returns recent posts for the authenticated user.
- You can pass standard Micropub parameters, e.g. `?q=source&limit=5` or `properties[]=content` in some implementations.

**Syndication targets:**

```http
GET /micropub?q=syndicate-to
```

- Returns configured external services that can receive cross‑posts.
- IDs (UIDs) are used with `mp-syndicate-to[]` when creating posts.

### 3.6 Multiple blogs & destinations

Micro.blog Premium allows multiple blogs per account. Micropub handles this via `destination` and `mp-destination`:

1. Call `GET /micropub?q=config` to get `destination` list:
   - Each entry has a `uid` (usually the blog URL) and name.
2. When creating a post, specify the target blog:

```text
h=entry
content=Post for my second blog
mp-destination=https://secondblog.micro.blog/
```

- If `mp-destination` is omitted, Micro.blog posts to the user’s default blog.
- For apps, consider showing a blog picker and remembering the last selection.

### 3.7 Cross‑posting (syndication) control

Micro.blog can cross‑post to external services configured by the user (e.g. Twitter, Mastodon, LinkedIn, Tumblr, Flickr, etc.). Micropub supports per‑post control using `mp-syndicate-to[]`:

**Get available targets:**

```http
GET /micropub?q=syndicate-to
```

Example response (simplified):

```json
{
  "syndicate-to": [
    { "uid": "twitter",  "name": "Twitter (@user)" },
    { "uid": "mastodon", "name": "Mastodon (@user@instance)" }
  ]
}
```

**Post to specific services only:**

```text
h=entry
content=Hello everywhere!
mp-syndicate-to[]=twitter
mp-syndicate-to[]=mastodon
```

- Only the listed services will receive the cross‑post.

**Disable syndication completely for a post:**

```text
h=entry
content=Stay on Micro.blog only.
mp-syndicate-to[]=
```

- An “empty” `mp-syndicate-to[]` means “do not syndicate anywhere”.

**Default behavior:**

- If you **omit** `mp-syndicate-to`, Micro.blog will cross‑post to **all** configured services for that account.

### 3.8 Micropub best‑practice notes

- Prefer Micropub for posting: you’ll get better compatibility and easier multi‑blog support.
- Use form‑encoded or JSON requests; both are supported.
- Understand that media uploads return **202** and use the `Location` header.
- Draft support is via `post-status=draft` and subsequent update to publish.
- Handle HTTP errors and read any returned error messages for debugging.

---

## 4. XML‑RPC / MetaWeblog API

Micro.blog exposes an XML‑RPC API for compatibility with traditional blog editors (MarsEdit, etc.). It supports MetaWeblog‑style methods plus a few custom methods.

### 4.1 Endpoint & discovery

XML‑RPC endpoint:

```text
https://micro.blog/xmlrpc
```

Each Micro.blog blog exposes an RSD (`rsd.xml`) at the blog root, e.g.:

```text
https://username.micro.blog/rsd.xml
```

This RSD file describes:

- API endpoint (`https://micro.blog/xmlrpc`)
- Supported APIs: `MetaWeblog`, `Micro.blog`
- The `blogID` to use for that site.

### 4.2 Authentication

XML‑RPC uses:

- `blogID` – blog identifier (from RSD).
- `username` – Micro.blog username.
- `password` – Micro.blog password or app‑specific password.

You pass these as the first parameters in most methods (`blogID`, `username`, `password`).

### 4.3 Common methods

Typical Micro.blog / MetaWeblog methods:

- `microblog.newPost` / `metaWeblog.newPost`
- `microblog.editPost` / `metaWeblog.editPost`
- `microblog.getPost` / `metaWeblog.getPost`
- `microblog.deletePost`
- `microblog.getPosts` / `metaWeblog.getRecentPosts`
- `microblog.getCategories` / `metaWeblog.getCategories`
- `microblog.newMediaObject` / `metaWeblog.newMediaObject`
- Page methods: `microblog.getPages`, `newPage`, `editPage`, `deletePage`

#### Example: newPost

A typical `newPost` call (simplified) looks like:

```xml
<methodCall>
  <methodName>microblog.newPost</methodName>
  <params>
    <param><value><string>10</string></value></param> <!-- blogID -->
    <param><value><string>username</string></value></param>
    <param><value><string>password</string></value></param>
    <param>
      <value>
        <struct>
          <member>
            <name>title</name>
            <value><string>My Post</string></value>
          </member>
          <member>
            <name>description</name>
            <value><string>HTML or Markdown content...</string></value>
          </member>
          <member>
            <name>post_status</name>
            <value><string>published</string></value>
          </member>
        </struct>
      </value>
    </param>
    <param><value><boolean>1</boolean></value></param> <!-- publish now -->
  </params>
</methodCall>
```

Return value is usually the post ID as a string.

#### Pages via XML‑RPC

XML‑RPC is currently the only programmatic way to manage **pages** (static pages):

- `microblog.newPage` – create a new page.
- `microblog.editPage` – edit an existing page.
- `microblog.deletePage` – delete a page.
- `microblog.getPages` – list pages.

Content fields are similar to posts (`title`, `description`, etc.) but the pages appear as static sections on your site rather than timeline entries.

### 4.4 When to use XML‑RPC

Use XML‑RPC only when:

- Integrating an editor that already speaks MetaWeblog (e.g. MarsEdit).
- You specifically need to programmatically manage pages and your tooling already uses XML‑RPC.

For new development, prefer Micropub + JSON.

---

## 5. Feeds (RSS / JSONFeed) – read‑only

Micro.blog publishes public feeds that require **no authentication**. They are ideal for read‑only integrations, mirrors, or static consumers.

### 5.1 User feeds

**User’s own posts:**

```text
https://username.micro.blog/feed.xml    # RSS
https://username.micro.blog/feed.json   # JSONFeed
```

**User’s photos (where supported):**

```text
https://username.micro.blog/photos/index.json
```

**Category‑specific feeds:**

```text
https://username.micro.blog/categories/{category}/feed.xml
https://username.micro.blog/categories/{category}/feed.json
```

### 5.2 Timeline and discover feeds

**Timeline feed for a user (people they follow):**

```text
https://micro.blog/feeds/{username}.xml
https://micro.blog/feeds/{username}.json
```

**Discover feeds:**

```text
https://micro.blog/posts/discover            # JSONFeed (curated)
https://micro.blog/posts/discover/books      # books collection
https://micro.blog/posts/discover/music      # etc.
```

### 5.3 Webmention activity

Micro.blog provides a feed of incoming Webmentions for a user:

```text
https://micro.blog/feeds/{username}/webmentions.json
```

This can be used to monitor who is linking to / commenting on a user’s posts from external IndieWeb sites.

### 5.4 WebSub (PubSubHubbub) & pings

- Micro.blog feeds generally support **WebSub**, allowing subscribers to be notified when feeds update.
- There is also a `ping` endpoint to manually tell Micro.blog that a feed has changed (more relevant when Micro.blog consumes external RSS).

For read‑only integrations, subscribing via WebSub can be preferable to polling.

---

## 6. Third‑party tools & libraries

Several tools and libraries exist to make working with Micro.blog easier.

### 6.1 CLI tools

#### 6.1.1 speck (Go CLI)

- A command‑line tool written in Go for interacting with Micro.blog.
- Can show your timeline and post updates from your terminal.
- Configured via YAML with your username and app token.
- Typically installed via Homebrew or Go tooling.

Usage examples (high‑level, not exact syntax):

- `speck` – display your timeline.
- `speck post` – open editor to compose a post and publish via Micropub.

#### 6.1.2 pst (Rust CLI)

- A simple Rust‑based CLI focused on posting:

  - `pst post "Your message"` – publish immediately.
  - `pst draft "Some draft text"` – create a draft.

- Reads a config file with your token.
- Good for scripting or quick posting from other command‑line workflows.

### 6.2 Official Swift framework: Snippets

**Snippets** is a Swift package provided by Micro.blog that wraps:

- Micro.blog JSON API
- Micropub API
- XML‑RPC / MetaWeblog (for WordPress, etc.)

Features:

- Designed for iOS/macOS apps.
- Provides higher‑level model objects and convenience methods.
- Includes a sample app demonstrating timeline + posting.

Use it if you’re building native Apple‑platform clients and want a ready‑made integration.

### 6.3 Micropub client libraries

Because Micro.blog speaks standard **Micropub**, you can use generic client libraries:

- **Python** – simple `requests` scripts or a Micropub helper library.
- **Node.js** – various Micropub / IndieWeb packages or a thin wrapper around `fetch`/Axios.
- **Ruby, PHP, etc.** – community IndieWeb libraries or direct HTTP calls.

Example in Python (pseudo‑code):

```python
import requests

TOKEN = "YOUR_TOKEN"
headers = {"Authorization": f"Bearer {TOKEN}"}

# 1. Get media endpoint
conf = requests.get("https://micro.blog/micropub?q=config", headers=headers).json()
media_endpoint = conf["media-endpoint"]

# 2. Upload image
with open("photo.jpg", "rb") as f:
    res = requests.post(media_endpoint, headers=headers, files={"file": f})
photo_url = res.headers["Location"]

# 3. Create post using that photo
data = {
    "h": "entry",
    "content": "Check out this photo!",
    "photo": photo_url,
    "mp-photo-alt": "A nice photo."
}
requests.post("https://micro.blog/micropub", headers=headers, data=data)
```

### 6.4 IndieWeb / Microsub ecosystem

- Micro.blog acts as a **Microsub server**, which means IndieWeb readers like Monocle or Together can use Micro.blog as their timeline backend.
- As a developer, you can:
  - Build a Micropub client that posts to Micro.blog.
  - Build a Microsub client that reads from Micro.blog.
- This is more advanced and mostly relevant if you intend to make IndieWeb‑native clients.

### 6.5 IFTTT / Zapier / Shortcuts

- No official Micro.blog app on IFTTT/Zapier, but you can use Webhooks to call Micropub:
  - Trigger → Webhook → `POST https://micro.blog/micropub` with Bearer token and content.
- iOS Shortcuts often post directly to Micro.blog via the Micropub endpoint.
- These are great for glue‑code automations (syncing from another source, scheduled posts, etc.).

---

## 7. Limitations, caveats, and best practices

- **No bulk import API:** For big migrations, use the web UI’s import (JSON or RSS) or carefully script Micropub posts while respecting rate constraints.
- **No official “delete everything” endpoint:** Bulk delete requires scripting over `DELETE /posts/{id}` (handle with extreme care).
- **No official categories/taxonomy API for posts:** Bookmarks and books have explicit tags/shelves; post “categories” are more theme‑dependent. Micropub supports `category`, but theme behavior may vary.
- **Media management is simple:** Upload via media endpoint, then reference the URL—no separate media library API beyond that.
- **Notes encryption:** If you touch Notes, implement AES‑GCM carefully and handle the user’s key securely. For most blog workflows you can ignore Notes entirely.
- **Cross‑posting is user‑configured:** Your Micropub client controls per‑post behavior via `mp-syndicate-to[]`, but the services themselves are configured/authorized in Micro.blog’s web UI.
- **Testing:** Use Micro.blog’s built‑in test blog and/or a non‑production account when experimenting with posting/deleting logic.

---

## 8. Site Rebuilds and Backdated Posts

Micro.blog uses Hugo as its static site generator. When you update posts via the API, the site needs to rebuild to reflect those changes. Understanding how and when rebuilds happen is critical for programmatic workflows.

### 8.1 When Micro.blog Rebuilds Your Site

Micro.blog automatically rebuilds your Hugo site when:

- **You create a new post** via any method (web UI, Micropub, XML-RPC)
- **You edit a post** via the web UI
- **You update theme/design settings** in the web interface
- **Periodically on a schedule** (typically every few hours)

### 8.2 No Direct Rebuild API Endpoint

**Important:** Micro.blog does not provide a direct API endpoint to trigger site rebuilds. There is no `POST /rebuild` or equivalent.

If you need to force a rebuild after updating posts via the API, your options are:

1. **Wait for automatic rebuild** - Usually happens within 1-4 hours
2. **Manual trigger via web UI**:
   - Go to Account → Logs → Click "Rebuild [yourdomain]"
   - Or: Account → Design → Make any design change (updates theme from GitHub)
3. **Programmatic workaround** - Create a minimal post to trigger rebuild:

```javascript
// Create a draft post to trigger rebuild without cluttering timeline
const response = await fetch('https://micro.blog/micropub', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: ['h-entry'],
    properties: {
      content: ['Rebuild trigger'],
      'post-status': ['draft']
    }
  })
});
```

The draft post triggers a rebuild but won't appear publicly. Delete it afterward from the web UI (Posts → Drafts).

### 8.3 Backdated Posts and Custom Domains

**Key Issue:** When you backdate a post (change its publication date to an earlier time), Micro.blog behavior differs between the `username.micro.blog` domain and custom domains:

#### What Happens When You Backdate

1. **Post is created** on current date: `https://yourblog.com/2025/12/05/my-post.html`
2. **You change the date** to an earlier time (e.g., July 2, 2025)
3. **Post URL changes** to: `https://yourblog.com/2025/07/02/my-post.html`
4. **Old URL returns 404** until the site rebuilds

#### Custom Domain vs. Micro.blog Domain

- **`username.micro.blog`** URLs typically work immediately
- **Custom domain** URLs may take time to appear:
  - The post exists on `micro.blog/posts/username`
  - The custom domain URL returns 404 until Hugo rebuilds
  - API queries may not find the post (it's outside the expected time range)

#### API Implications

When working with backdated posts programmatically:

**Micropub Updates:**
```javascript
// ❌ This will fail with 404 if post is backdated and site hasn't rebuilt
await updateMicroblogPost(
  'https://yourblog.com/2025/12/05/my-post.html',  // Old URL
  { photo: posterUrl }
);

// ✅ Use the new URL that matches the backdated date
await updateMicroblogPost(
  'https://yourblog.com/2025/07/02/my-post.html',  // Correct URL
  { photo: posterUrl }
);
```

**JSON API:**
- Backdated posts may not appear in recent API results
- They're sorted by publication date, not creation date
- Increase `count` parameter or use date-based filtering if available

**XML-RPC:**
- May also fail to find backdated posts by ID
- The post ID remains the same, but internal routing may be affected

#### Best Practices for Backdated Posts

1. **Backdate before enrichment**: Set the correct date before adding images/metadata
2. **Trigger rebuild immediately**: Create a dummy post to force site regeneration
3. **Use correct URLs**: Always use the URL that matches the post's final publication date
4. **Wait for API sync**: Allow time for the post to appear in API results after backdating
5. **Test URLs**: Verify the post URL returns 200 before attempting updates

#### Example Workflow: Enriching a Backdated Post

```javascript
// 1. Find the post (may need larger count if backdated far in past)
const posts = await fetchMicroblogPostsViaApi(token, {
  count: 200,  // Increase count to find older posts
  username: 'youruser'
});

// 2. Verify the post URL is accessible
const response = await fetch(post.url);
if (!response.ok) {
  console.log('Post URL returns 404 - site needs rebuild');
  // Trigger rebuild by creating temporary post
}

// 3. Update using the correct URL from API
await updateMicroblogPost(post.url, {
  photo: imageUrl
});

// 4. Trigger another rebuild to show changes
// (Create/delete dummy post)
```

### 8.4 Theme Updates and Rebuilds

If you're developing a custom theme:

- **Push to GitHub**: Update your theme repository
- **Pull in Micro.blog**:
  - Account → Design → Click "New Template" (pulls from GitHub)
  - This triggers a site rebuild with the new theme code

The `/watching/` page example:
- Theme template reads post content to extract images
- If posts are updated with new images after page is built
- Page won't show new images until Hugo rebuilds
- Creating a new post forces rebuild and updates the page

### 8.5 Troubleshooting Rebuild Issues

**Problem:** Updated a post via API but changes don't appear on site

**Solutions:**
1. Check if custom domain URL returns 200 (not 404)
2. Verify the update succeeded: fetch post via JSON API and check `content_html`
3. Trigger a rebuild (create dummy post or use web UI)
4. Wait 2-5 minutes for rebuild to complete
5. Clear browser cache and check again

**Problem:** Post disappeared after backdating

**Diagnosis:**
- Post still exists on `micro.blog/posts/username`
- Custom domain URL returns 404
- Post isn't in recent API results

**Solution:**
- Use web UI to verify post exists and note its current URL
- Trigger site rebuild
- Wait for rebuild to complete
- Verify new URL based on backdated publish date

---

## 9. Quick "decision tree" for integrations

**You want to…** | **Recommended API**
------------------|-------------------
Read your timeline or mentions | JSON API (`/posts/timeline`, `/posts/mentions`)
Read your own posts / photos | JSON API (`/posts/{username}`, `/posts/{username}/photos`) or JSONFeed
Create/edit/delete posts | **Micropub** (`/micropub`) with `action=create/update/delete`
Create replies | Micropub (`in-reply-to`) or JSON `/posts/reply`
Create bookmarks | Micropub (`bookmark-of`, optional `bookmark-content`)
Manage bookmarks & highlights | JSON Bookmarks API (`/posts/bookmarks`, `/posts/bookmarks/highlights`)
Track books & reading goals | Books API (`/books/...`)
Work with encrypted notes | Notes API (`/notes/...`)
Use an existing blog editor (e.g. MarsEdit) | XML‑RPC (`/xmlrpc`)
Consume content in another app / static site | RSS/JSONFeed (`/feed.xml`, `/feed.json`)
Build a native iOS/macOS app | Snippets (Swift) + JSON/Micropub

---

## 10. Summary

Micro.blog offers a rich, standards‑friendly surface area for programmatic access:

- **JSON API** for reading timelines and managing social graph, bookmarks, books, and notes.
- **Micropub** for creating, editing, and deleting posts (text, photos, replies, bookmarks, likes, reposts, drafts, multi‑blog publishing, cross‑posting).
- **XML‑RPC** for compatibility with classic editors and page management.
- **RSS/JSONFeed** for read‑only consumption by any feed reader or static tooling.
- **Third‑party tools** and libraries (CLI tools, Swift framework, IndieWeb libraries) to integrate into almost any workflow.

For new development, the recommended pattern is:

1. **Use Micropub** for all content creation/editing.
2. **Use JSON API / feeds** for reading timelines and auxiliary data.
3. Only drop to **XML‑RPC** when you must support legacy tools or page management.
4. **Always trigger rebuilds** after API updates if you need immediate visibility.
5. **Handle backdated posts carefully** by using correct URLs and allowing time for site regeneration.

This gives you the broadest compatibility and aligns your tooling with IndieWeb standards, while still taking advantage of Micro.blog‑specific features like books, bookmarks, and encrypted notes.
