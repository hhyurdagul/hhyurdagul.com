local site_url = hook_config["site_url"]
if not site_url then
	Log.warning("post-build sitemap: missing site_url, skipping")
	return
end

-- Remove trailing slash if present
site_url = Regex.replace(site_url, "/+$", "")

function url_compare(a, b)
	if a < b then
		return -1
	elseif a > b then
		return 1
	else
		return 0
	end
end

local seen = {}
local urls = {}
local u_i = 1

-- Index pages are not always present in site_index, add them explicitly
local u = "/"
if not seen[u] then
	seen[u] = true
	urls[u_i] = u
	u_i = u_i + 1
end

u = "/writing/"
if not seen[u] then
	seen[u] = true
	urls[u_i] = u
	u_i = u_i + 1
end

u = "/projects/"
if not seen[u] then
	seen[u] = true
	urls[u_i] = u
	u_i = u_i + 1
end

local i = 1
while site_index[i] do
	u = site_index[i]["url"]
	if u and not seen[u] then
		seen[u] = true
		urls[u_i] = u
		u_i = u_i + 1
	end
	i = i + 1
end

Table.sort(url_compare, urls)

local lines = {}
local l_i = 1
lines[l_i] = '<?xml version="1.0" encoding="UTF-8"?>'
l_i = l_i + 1
lines[l_i] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
l_i = l_i + 1

local j = 1
while urls[j] do
	lines[l_i] = "  <url><loc>" .. site_url .. urls[j] .. "</loc></url>"
	l_i = l_i + 1
	j = j + 1
end

lines[l_i] = "</urlset>"

local out_file = Sys.join_path(build_dir, "sitemap.xml")
Sys.write_file(out_file, String.join("\n", lines) .. "\n")
