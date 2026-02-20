---@diagnostic disable: undefined-global
-- Adds a CSS class to elements matched by selector.
--
-- Config:
--   selector (required)  CSS selector
--   class (required)     class name to add

local selector = config["selector"]
local class_name = config["class"]

if not selector then
  Plugin.fail("add_class: missing 'selector' option")
end

if not class_name then
  Plugin.fail("add_class: missing 'class' option")
end

local elements = HTML.select(page, selector)
local i = 1
while elements[i] do
  HTML.add_class(elements[i], class_name)
  i = i + 1
end
