---@diagnostic disable: undefined-global
---
--- Renders a list of entries from the site index.
---
--- Config:
---   type (required)        type of index to render
---   index_selector (required)  CSS selector for the index container
---   homeview (optional)    whether to render the index on the homepage
---
--- Supported types:
---   writing_index
---   home_writing_index
---   project_index

local type = config["type"]
local index_selector = config["index_selector"]
local index_page = ""
if config["homeview"] then
	index_page = "home_"
end


local template_name = index_page .. type .. "_index"

local template = {}

template["writing_index"] = [[
{% for e in entries %}
<article class="writing-post">
  <div class="writing-meta">
    <span>{{e.date}}</span>
    <div class="dot"></div>
    <span>{{e.reading_time}}</span>
    <div class="dot"></div>
    <span>{{e.category}}</span>
  </div>
  <a href="{{e.url}}">
    <h3>{{e.title}}</h3>
  </a>
  {% if e.excerpt %}<p>{{e.excerpt}}</p>{% endif %}
  <a href="{{e.url}}">
    <div class="writing-read-more">Read Log
      <svg><use href="#icon-arrow-right"></use></svg>
    </div>
  </a>
</article>
{% endfor %}
]]

template["home_writing_index"] = [[
{% for e in entries %}
{% if e.showcase %}
<article class="writing-post">
  <div class="writing-meta">
    <span>{{e.date}}</span>
    <div class="dot"></div>
    <span>{{e.reading_time}}</span>
    <div class="dot"></div>
    <span>{{e.category}}</span>
  </div>
  <a href="{{e.url}}">
    <h3 style="font-size: 1.125rem; margin-bottom: 0.5rem;">{{e.title}}</h3>
  </a>
  {% if e.excerpt %}<p style="font-size: 0.9rem;">{{e.excerpt}}</p>{% endif %}
  <a href="{{e.url}}">
    <div class="writing-read-more" style="margin-top: 0.5rem;">Read Log
      <svg><use href="#icon-arrow-right"></use></svg>
    </div>
  </a>
</article>
{% endif %}
{% endfor %}
]]

template["project_index"] = [[
<div class="project-card">
  <div class="project-header">
    <h3>{{title}}</h3>
    <a href="{{url}}">
      <svg><use href="#icon-arrow-right"></use></svg>
    </a>
  </div>
  {% if excerpt %}<p>{{excerpt}}</p>{% endif %}

  <div class="project-tags">
    {% for tag in tags %}
    <span>{{tag}}</span>
    {% endfor %}
  </div>
</div>
]]



if not type then
	Log.warning('render-index: missing "type", skipping')
	return
end

if not index_selector then
	Log.warning('render-index: missing "index_selector", skipping')
	return
end


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

local rendered_entries = HTML.parse(String.render_template(template[template_name], env))
HTML.append_child(container, rendered_entries)
