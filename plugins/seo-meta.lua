---@diagnostic disable: undefined-global
-- Adds SEO essentials:
-- - <title>
-- - meta description
-- - canonical URL
-- - OpenGraph and Twitter cards
--
-- Configuration:
--   site_url (required for best results): e.g. "https://hhyurdagul.com"
--   site_name (optional): defaults to "Hasan Hüseyin Yurdagül"
--   title_suffix (optional): defaults to " | Hasan Hüseyin Yurdagül"

function ensure_trailing_slash(url)
  if Regex.match(url, "(.*)/$") then
    return url
  end
  return url .. "/"
end

function normalize_page_url(u)
  if not u then
    return "/"
  end
  if u == "" then
    return "/"
  end
  return u
end

function upsert_meta_by_name(head, name, content)
  local selector = 'meta[name="' .. name .. '"]'
  local existing = HTML.select_one(page, selector)
  if existing then
    HTML.set_attribute(existing, "content", content)
    return
  end

  local meta = HTML.create_element("meta")
  HTML.set_attribute(meta, "name", name)
  HTML.set_attribute(meta, "content", content)
  HTML.append_child(head, meta)
end

function upsert_meta_by_property(head, property, content)
  local selector = 'meta[property="' .. property .. '"]'
  local existing = HTML.select_one(page, selector)
  if existing then
    HTML.set_attribute(existing, "content", content)
    return
  end

  local meta = HTML.create_element("meta")
  HTML.set_attribute(meta, "property", property)
  HTML.set_attribute(meta, "content", content)
  HTML.append_child(head, meta)
end

function upsert_link(head, rel, href)
  local selector = 'link[rel="' .. rel .. '"]'
  local existing = HTML.select_one(page, selector)
  if existing then
    HTML.set_attribute(existing, "href", href)
    return
  end

  local link = HTML.create_element("link")
  HTML.set_attribute(link, "rel", rel)
  HTML.set_attribute(link, "href", href)
  HTML.append_child(head, link)
end

function set_title(head, title_text)
  local title_el = HTML.select_one(head, "title")
  if not title_el then
    title_el = HTML.create_element("title")
    HTML.append_child(head, title_el)
  end

  HTML.replace_content(title_el, HTML.create_text(title_text))
end

function normalize_whitespace(t)
  if not t then
    return nil
  end
  -- Collapse whitespace/newlines to single spaces
  t = Regex.replace_all(t, "[ \t\r\n]+", " ")
  t = String.trim(t)
  return t
end

function first_non_empty_text(selectors)
  local i = 1
  while selectors[i] do
    local el = HTML.select_one(page, selectors[i])
    if el then
      local t = HTML.inner_text(el)
      t = normalize_whitespace(t)
      if t then
        if String.length_ascii(t) > 0 then
          return t
        end
      end
    end
    i = i + 1
  end
  return nil
end

function make_description_text(raw)
  if not raw then
    return nil
  end

  local t = normalize_whitespace(raw)
  -- Keep it in a search-snippet-friendly range
  t = String.truncate_ascii(t, 160)
  return t
end

local head = HTML.select_one(page, "head")
if not head then
  Plugin.fail("seo-meta: page has no <head>")
end

local site_url = config["site_url"]
if not site_url then
  -- Leave canonical/og:url empty-ish if user didn't configure, but still set titles/descriptions.
  site_url = "https://example.com"
end
site_url = ensure_trailing_slash(site_url)

local site_name = config["site_name"]
if not site_name then
  site_name = "Hasan Hüseyin Yurdagül"
end

local title_suffix = config["title_suffix"]
if not title_suffix then
  title_suffix = " | " .. site_name
end

local u = normalize_page_url(page_url)
-- Remove leading slash before joining
local path = Regex.replace(u, "^/+", "")
local canonical_url = site_url .. path

-- Title source: prefer hidden H1s you can add to pages
local base_title = first_non_empty_text({"main#content h1", "main#content h2", "main#content h3"})
if not base_title then
  base_title = site_name
end

local full_title = base_title
if base_title ~= site_name then
  full_title = base_title .. title_suffix
end

set_title(head, full_title)

local description = nil
local desc_el = HTML.select_one(page, "data#excerpt")
if desc_el then
  local raw_desc = HTML.inner_text(desc_el)
  description = make_description_text(raw_desc)
end

if description then
  upsert_meta_by_name(head, "description", description)
end
upsert_meta_by_name(head, "robots", "index,follow")
upsert_link(head, "canonical", canonical_url)

-- OpenGraph
upsert_meta_by_property(head, "og:title", full_title)
if description then
  upsert_meta_by_property(head, "og:description", description)
end
upsert_meta_by_property(head, "og:url", canonical_url)
upsert_meta_by_property(head, "og:site_name", site_name)

local og_type = "website"
-- Treat /writing/* pages as articles (but keep /writing as a normal section page)
if String.starts_with(u, "/writing/") then
  og_type = "article"
end
upsert_meta_by_property(head, "og:type", og_type)

-- Default social preview image (can be overridden in widget config)
local image_path = config["og_image"]
if not image_path then
  image_path = "/web-app-manifest-512x512.png"
end

local image_url = nil
if image_path then
  image_path = Regex.replace(image_path, "^/+", "")
  image_url = site_url .. image_path
  upsert_meta_by_property(head, "og:image", image_url)
  upsert_meta_by_name(head, "twitter:image", image_url)
end

-- Twitter cards
local twitter_card = "summary"
if image_url then
  twitter_card = "summary_large_image"
end
upsert_meta_by_name(head, "twitter:card", twitter_card)
upsert_meta_by_name(head, "twitter:title", full_title)
if description then
  upsert_meta_by_name(head, "twitter:description", description)
end
