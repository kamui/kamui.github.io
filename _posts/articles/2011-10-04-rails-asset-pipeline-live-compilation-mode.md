---
layout: post
title: "Rails Asset Pipeline Live Compilation Mode"
excerpt: ""
comments: true
category: articles
tags: [ruby on rails]
---

Rails 3.1 comes with a [live compilation mode](http://guides.rubyonrails.org/asset_pipeline.html#live-compilation) for serving static assets, but in order to describe what it does we'll need to go over the recommended method of serving up static assets in Rails.

Normally, after a deploy, it's recommended you run:

```bash
rake assets:precompile
```

This will run in the production environment even without specifying a RAILS_ENV. This rake task compiles all your static assets to:

```bash
public/assets
```

Usually, you'll do this via a post deploy hook. Then your Rails app will serve the files via the ActionDispatch::Static rack middleware.

Let's say you decide to not precompile your assets. Any requests to a static asset will return a 404 because it can't find the asset. However, if you turn on live compilation, Rails will compile static assets on the fly. To turn it on:

```ruby config/environment/production.rb
config.serve_static_assets = true
```

By default, around line 12, you'll see that this is set to false. This isn't recommended, since there's more processing involved than the precompile route.

<!-- more -->

###Precompiling AND live compilation

You can both precompile assets and enable live compilation. In this case, the ActionDispatch::Static rack middleware will serve the precompile assets, but if any asset can't be found, it'll fall back to live compilation. This could possibly be beneficial since I've experienced instances where my SASS files fail to precompile for some reason, but it can be confusing when debugging. I'd recommend trying to resolve precompilation issues instead of relying on a live compilation fallback though.

###Where does Rails compile the static assets?

You'll find that the assets get compiled to:

```bash
tmp/cache/assets
```

Compilation occurs on the first request of a controller action. You'll notice it's named and arranged differently than if you had run the precompile task.

###If you're on Heroku...

When you deploy on Heroku, you might have noticed this line:

```bash
Injecting rails3_serve_static_assets
```

All this does is set:

```ruby
config.serve_static_assets = true
```

Which of course turns on live compilation. I've run into some issues with assets not precompiling correctly and somehow assets still rendered. It made it difficult to debug, until I noticed that Heroku did this. Maybe it'll save someone else some frustration.
