---@diagnostic disable: undefined-global
-- Conditionally inject highlight CSS only when highlighted code is present.
--
-- Looks for any element with class "hl" (highlight's output).
--
-- Config:
--   css_href (optional) default: "/assets/highlight/highlight.css"

local css_href = config["css_href"]
if not css_href then
  css_href = "/assets/highlight/highlight.css"
end

local has_hl = HTML.select_one(page, ".hl")
if not has_hl then
  return
end

local head = HTML.select_one(page, "head")
if not head then
  return
end

local existing = HTML.select_one(page, 'link[rel="stylesheet"][href="' .. css_href .. '"]')
if existing then
  return
end

local link = HTML.create_element("link")
HTML.set_attribute(link, "rel", "stylesheet")
HTML.set_attribute(link, "href", css_href)
HTML.append_child(head, link)
