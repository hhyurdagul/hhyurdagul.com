<data id="showcase" value="1"></data>

# A Small Example of What Agentic AI Benchmarks Should Actually Be

Everybody I know who actually works with LLMs hates benchmarks. They're biased, gamed, and rarely translate to real-world utility. But there is no escape from them because benchmarks are the only proofs we have of what these models can do.

Since leaderboards can't be trusted completely when I want to choose a model to work with, the only real solution to select correctly is to test them myself extensively. But that's as you have probably done it before knows is very tedious. New models drop weekly, each with different pricing, latency, and capabilities, and keeping up feels impossible. So we tend to stick with what we know, like Opus or Codex models.

Now of course, there is the opinions of other people, and it consntaly changes but you can get the general idea following others and understand which models are good for which tasks. For example, you might know that Gemini is pretty good in generating UI than other models, and in the past Opus models was very bad at generating UIs especially compared with Codex, but now it is swapped, when followed general knowledge, it seems the roles reversed, for UI Opus is better and for engineering tasks Codex is better. 

What is great about going with collective ideas of humans is that they are much more trustable than leaderboards because the knowledge comes from real life, but those real life usages biased towards vibe-coding. What I mean by this is, people use and have most of their ideas come from using models in one-shot or vibe coding scenarious, where understanding of the codebase has no value at all, because they are always telling AI to do any of the job. But this is very overhyped, in a case of losing an access to big models or cleaning the context would create much much more work to do, because it should understand all the codebase from very beginning because you don't know what the codebase looks like and it grow bigger much faster than you expected.

So evaluations should come from humans yes, but it should be done in a way that it is not biased towards vibe-coding. The real strength of the models can be understood if it is really used as a pair programmer, where you have the absolute idea of what the code does and you don't want to write every bit of the code for reasons like repeating, or knowing the logic but having the ai write it will be much faster etc. This should be the form of benchmarking of these models, this way they can't be bechmaxed and would have a real impact of helping people.

To showcase what I am talking about in a practical sense, I want to talk about a problem, and laziness of mine, which is redesigning my personal website, and really start publishing some content this time. There is some steps to this:

1. Use AI ([Gemini](https://gemini.google.com/)) to generate the CSS of the website.
2. Use some sort of static site generator ([Soupault](https://soupault.net)) to generate the HTML of the website.
    - Create the basic template of the site to make AI understand the structure of the website. Because soupault is very odd and unused site generator, AI's are not happy about it, they just know its name, and does not how to operate it.
3. Get the raw code of the design file from AI as HTML.
4. Prompt the agentic framework using the template and the raw HTML to generate the final project.

This is actually very easy, and this idea came to me in the middle of doing things manually so I have a pretty good template for AI to work with. And I have a design too.

## The example


Soupault uses a `soupault.toml` file to configure the site. It creates some index pages based on the template you provide in that file. It is that easy.

My problem is that, I want to implement a `blog-entry`, and `project-card` component for my indexes, as entry points to real pages, and I have the design as HTML code.
And like I said before, I have a already created the template for blog entry and I just want AI to copy the exact same thing for `project-card`.

Here is the template for `blog-entry` in `soupault.toml`:

```toml
[index.views.writing]
  index_selector = ".writing-list"
  section = "writing/"
  include_subsections = true
  exclude_page = "writing/index.html"
  sort_by = "date"
  sort_type = "calendar"
  sort_descending = true
  index_template = """
    {% for e in entries %}
    <a href=\"{{e.url}}\">
      <article class="blog-post">
        <div class="blog-meta">
          <span>{{e.date_display}}</span>
          <div class="dot"></div>
          <span class="reading-time">{{e.reading_time}}</span>
        </div>
        <h3>{{e.title}}</h3>
        {% if e.excerpt %}<p>{{e.excerpt}}</p>{% endif %}
        <div class="read-more">Read Log
          <svg><use href="#icon-arrow-right"></use></svg>
        </div>
      </article>
    </a>
    {% endfor %}
  """
```

I don't want to repeat myself, but this above code ensures that the AI agent have some example that it can work with.
The thing that I want to do is pretty much the same thing, but I don't want to copy and paste the code by hand, AI should be able to generate the code for me.

Also in the template code above, there some variables like {{e.title}}, and if I needs to understand it, can just look the other parts of the file and understand easily. This is the separation between copying the code to web app, pasting answer to the editor and agentic AI. It should just do it automatically.


Let's stay on the topic, so here is the example design of the project card:

![Example Project Card Image](./example-project-card.png)

And here is the code for that example project card:

```html
<div class="project-card">
  <div class="project-header">
    <h3>Causal Inference Engine</h3>
    <a href="#">
      <svg>
        <use href="#icon-arrow-right"></use>
      </svg>
    </a>
  </div>
  <p>A distributed system designed to separate correlation from causation in massive datasets. Built to strip
    away
    noise and reveal underlying truths.</p>
  <div class="tech-tags">
    <span>Python</span><span>PyTorch</span><span>C++</span><span>CUDA</span>
  </div>
</div>
```

It is pretty basic stuff, what the llms have to do is to extract the code and insert it as a template.

Here there is already a toml entries for the project view, the AI only needs to write the template and nothing more.

```toml
[index.views.projects]
  index_selector = ".projects-grid"
  section = "projects/"
  include_subsections = true
  exclude_page = "projects/index.html"
  sort_by = "title"
  sort_type = "lexicographic"
  sort_descending = false
```


There are some catches that will make us to evaluate the llms.
- It has to figure out how will it get the tags from soupualts internal variables. (They do not know it and have to figure it out.)
    - Example of {{e.title}} in the above example.
- They should not generate unknown template codes thing of the air.

I will not give them any documentation to understand how it is done, this can be done just by looking at the example code.


## The results

The prompt is pretty simple: I want you to take a look at @soupault.toml and create a `project view` inside it based on the design in @site/projects/index.html. You can use the template of `writing view` as an example of how templating language works. Don't create meaningles syntax.

All the agents are used within [Opencode](https://opencode.ai/).

### Codex 5.3

![Codex Result](./codex.png)

```
{% for e in entries %}
<div class="project-card">
  <div class="project-header">
    <h3>{{e.title}}</h3>
    <a href="{{e.url}}">
      <svg><use href="#icon-arrow-right"></use></svg>
    </a>
  </div>
  {% if e.excerpt %}<p>{{e.excerpt}}</p>{% endif %}
  {% if e.project_tags %}
  <div class="tech-tags">
    <span>{{e.project_tag}}</span>
  </div>
  {% endif %}
</div>
{% endfor %}
```

- It finely did what it needs to do, but went over its head to manipulate the code outside of the templates a bit, not too much but a bit.
- It took too much for this basic task in my opinion.


### Gemini 3.1 Pro

![Gemini Result](./gemini.png)


### Minimax M2.5

![Minimax Result](./minimax.png)

- It did create perfectly, did go overboard, but I have one more index page that I will prompt eventualy to do it, it already have done it, didn't change anything other than templates.
- It was fast enough.

```
{% for e in entries %}
<div class="project-card">
  <div class="project-header">
    <h3>{{e.title}}</h3>
    <a href="{{e.url}}">
      <svg><use href="#icon-arrow-right"></use></svg>
    </a>
  </div>
  {% if e.excerpt %}<p>{{e.excerpt}}</p>{% endif %}
  {% if e.project_tags %}
  <div class="tech-tags">
    <span>{{e.project_tag}}</span>
  </div>
  {% endif %}
</div>
{% endfor %}
```


### GLM5

![GLM Result](./glm.png)

```
{% for e in entries %}
<div class="project-card">
  <div class="project-header">
    <h3>{{e.title}}</h3>
    <a href="{{e.url}}">
      <svg><use href="#icon-arrow-right"></use></svg>
    </a>
  </div>
  {% if e.excerpt %}<p>{{e.excerpt}}</p>{% endif %}
  {% if e.project_tags %}
  <div class="tech-tags">
    {% for tag in e.project_tags:split(",") %}
    <span>{{tag}}</span>
    {% endfor %}
  </div>
  {% endif %}
</div>
{% endfor %}
```


GLM coulnd't do it the first time, because eventhough I stated it it created a syntax from thing air `project_tags:split(",")` which there is a zero evidence that code will work but GLM went ahead and did it. It tried to be smart about project tags, and yes the end results should really be like that, split by commas maybe, it could work out but the syntax is wrong. There is no `:split` in the template that I am using and Soupalt screaming that it can't build, I make it work in the second time because I know where the error is. I just told it the split can't be used here and it fixed itself but it is really baffling to see the AI create a syntax eventhough it is said to not do it.

This shows that when working with niche projects and tools that are not React or Next.js or Javascript or even Python, the AI may not be able to create the best results immediately. At my examples AI's didn't need to know how soupault worked because the example is already solveable if you have a knowledge of coding, because there are immediate examples to follow. And there may come a time wherethe big companies will not be able to provide cheap coding plans and you might have to use open source ones, or this may not happen but in the end, a little bit of smart model, can do the things you want to do, we just need to know how smart are they and not how they can one shot a website or app or anything. Don't buy the benchmaxing and don't try to create using that way, this will be the optimal usage of AI, and our benchmarks need to be able align with real use cases like these ones.
