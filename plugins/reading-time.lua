---@diagnostic disable: undefined-global
-- Makes a reading time estimate based on word count.
--
-- Sample configuration:
--
-- [plugins.reading_time]
--   file = "plugins/reading-time.lua"
--
-- [widgets.reading-time]
--   widget = "reading_time"
--   reading_speed = 150
--
--   # Where to insert the reading time estimate
--   selector = "span#reading-time"
--
--   # Where to extract the text for word count
--   content_selector = "main"
--
-- Minimum soupault version: 1.6
-- Author: Daniil Baturin
-- License: MIT

local reading_speed = config["reading_speed"]
local selector = config["selector"]
local content_selector = config["content_selector"]

if (not reading_speed) then
  Log.warning("Missing option \"reading_speed\", using default (180 WPM)")
  reading_speed = 180
end

if (not selector) then
  Log.warning("Missing option \"selector\", using default (body)")
  selector = "body"
end

if (not content_selector) then
  Log.warning("Missing option \"content_selector\", using default (body)")
  content_selector = "body"
end

-- Extract the content
local content_element = HTML.select_one(page, content_selector)
local content = HTML.strip_tags(content_element)

-- Calculate the word count
local words = Regex.split(content, "\\s+")
local word_count = size(words)

-- Make a reading time text
local reading_time = floor(word_count / reading_speed)

local time_msg = ""
if (reading_time <= 1) then
  time_msg = "less than a minute read"
else
  time_msg = reading_time .. " minutes read"
end


local element = HTML.create_element("post-reading-time", time_msg)
-- Insert the text in the target element
local target = HTML.select_one(page, selector)
if target then
  HTML.append_child(target, element)
end
