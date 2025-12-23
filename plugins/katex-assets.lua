---@diagnostic disable: undefined-global
-- Conditionally inject KaTeX CSS only when math is present.
--
-- Looks for:
--   .inline-math or .display-math (source markers)
--   .katex or .katex-display     (rendered output)
--
-- Config:
--   css_href (optional) default: "/assets/katex/katex.min.css"

local css_href = config["css_href"]
if not css_href then
  css_href = "/assets/katex/katex.min.css"
end

local has_math = HTML.select_any_of(page, {
  ".inline-math",
  ".display-math",
  ".katex",
  ".katex-display"
})

if not has_math then
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
