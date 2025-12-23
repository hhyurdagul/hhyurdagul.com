---@diagnostic disable: undefined-global
-- Marks the current section link as active in the top navigation
--
-- Assumes the template contains links to:
--   /          (Home)
--   /writing   (Writing section)
--   /projects  (Projects section)

local links = HTML.select(page, "nav a")

-- Clear any existing state first
local i = 1
while links[i] do
  local link = links[i]
  HTML.remove_class(link, "active")
  HTML.delete_attribute(link, "aria-current")
  i = i + 1
end

-- Apply active class based on page_url
local j = 1
while links[j] do
  local link = links[j]
  local href = HTML.get_attribute(link, "href")

  if href then
    if href == "/" then
      if (page_url == "/") or (page_url == "") or (page_url == "/index.html") then
        HTML.add_class(link, "active")
        HTML.set_attribute(link, "aria-current", "page")
      end
    else
      if String.starts_with(page_url, href) then
        HTML.add_class(link, "active")
        HTML.set_attribute(link, "aria-current", "page")
      end
    end
  end

  j = j + 1
end
