---
layout: post
title: "Mongoid doesn't preload models in rake tasks"
excerpt: ""
date: 2011-10-10 15:34
comments: true
category: articles
tags: [mongoid, ruby on rails, rake]
---

I have a Rails application with an initializer that accesses my [Mongoid](http://mongoid.org) models. This works fine locally when I run `rails s`, but when I deploy to Heroku, the deployment will eventually timeout as Heroku tries to run:

```ruby
rake assets:precompile
```

It's not just Heroku though. If I run that rake task locally, it will also just seem to freeze or lock up when it tries to access any Mongoid model. I've verified this with the ruby debugger.

It turns out that Mongoid only preloads your models when $rails_rake_task is false (ie. not a rake task). Here's the [Github issue](https://github.com/mongoid/mongoid/issues/387) where this change was made. I'm not sure why this was changed. I guess most rake tasks don't need to eager load the models since they don't need to access them. To work around this, I've just put a condition also checking for $rails_rake_task. In my case, the initializers need to access the models when the app starts up, not when rake tasks are run.

Update 10/12/2011 - Looks like I posted this too soon. This is [coming back](https://github.com/mongoid/mongoid/commit/2ff10c9aa2a7812a7f23a26fcd314623541290cc).
