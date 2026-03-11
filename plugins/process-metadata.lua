---@diagnostic disable: undefined-global
-- Adds a CSS class to elements matched by selector.
--
-- Config:
--   type (required)     metadata type

local type = config["type"]

if not type then
  Plugin.fail("process-metadata: missing 'type' option")
end


local title = HTML.select_one(page, "h1")
if not title then
  title = HTML.select_one(page, "post-title")
end

if not title then
    Plugin.fail("process-metadata: missing title")
end


local dot = HTML.create_element("div")
HTML.add_class(dot, "dot")

if type == "blog" then


    local date = HTML.inner_text(HTML.select_one(page, "post-date"))
    local read_time = HTML.inner_text(HTML.select_one(page, "post-reading-time"))
    local category = HTML.inner_text(HTML.select_one(page, "post-category"))


    local header = HTML.create_element("header")
    HTML.add_class(header, "writing-header")

    local meta = HTML.create_element("div")
    HTML.add_class(meta, "writing-meta")

    HTML.append_child(meta, HTML.create_element("span", date))
    HTML.append_child(meta, dot)
    HTML.append_child(meta, HTML.create_element("span", read_time))
    HTML.append_child(meta, dot)
    HTML.append_child(meta, HTML.create_element("span", category))

    HTML.append_child(header, meta)

    HTML.prepend_child(HTML.select_one(page, "article"), header)
    HTML.append_child(header, title)

end


-- local elements = HTML.select(page, selector)
-- local i = 1
-- while elements[i] do
--   HTML.add_class(elements[i], class_name)
--   i = i + 1
-- end
