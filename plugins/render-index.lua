---@diagnostic disable: undefined-global

local default_index_template = [[
{% for e in entries %}
<article class="writing-post">
  <div class="writing-meta">
    <span>{{e.date}}</span>
    <div class="dot"></div>
    <span>{{e.reading_time}}</span>
    <div class="dot"></div>
    <span>{{e.category}}</span>
  </div>
  <h3>{{e.title}}</h3>
  {% if e.excerpt %}<p>{{e.excerpt}}</p>{% endif %}
  <a href="{{e.url}}">
    <div class="writing-read-more">Read Log
      <svg><use href="#icon-arrow-right"></use></svg>
    </div>
  </a>
</article>
{% endfor %}
]]

local index_template = config["index_template"] or default_index_template
local index_selector = config["index_selector"]

if not index_selector then
  Log.warning('render-index: missing "index_selector", skipping')
  return
end

local container = HTML.select_one(page, index_selector)
if not container then
  Log.warning('render-index: container not found for selector "' .. index_selector .. '", skipping')
  return
end

local env = {
  entries = site_index or {},
}

local rendered_entries = HTML.parse(String.render_template(index_template, env))
HTML.append_child(container, rendered_entries)
