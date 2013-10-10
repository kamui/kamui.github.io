---
layout: post
title: "Rails Asset Pipeline, Content Delivery Networks and Rack::Cache"
excerpt: ""
comments: true
category: articles
tags: [ruby on rails, cdn]
---

So you have a brand new Rails 3.1 app and you're using the new asset pipeline feature. You're also using a content delivery network (CDN) like [Amazon CloudFront](http://aws.amazon.com/cloudfront/) or [Cloudflare](https://www.cloudflare.com/) to serve up static assets. Everything's working great, but little do you know, Rails is polluting your cache storage with static assets!

When you use a CDN, a request for a static asset will hit the CDN first. If the CDN doesn't have that asset on its servers, it will request the asset from your Rails app and then store it across it's global distribution network. The next time the asset is requested, it will be served up from the closest geographical data center to the user. This hopefully gives the effect that your website is loading faster.

<!-- more -->

##Rack::Cache is enabled in Rails 3.1

Well, by default, the Rails 3.1 production config will contain this:

```ruby
# config/environments/production.rb
config.action_controller.perform_caching = true
```

This configuration turns on:

- Page caching
- Action caching
- Fragment caching
- [Rack::Cache](http://rtomayko.github.com/rack-cache/) at the top of the rails middleware stack

The last one, Rack::Cache, does HTTP caching via http headers, ie 'Cache-Control', 'Expires'. It uses your Rails config.cache_store as its datastore.

##Why is Rack::Cache caching my static assets?

On a typical static asset request, Rack::Cache will check to see if that asset is in the cache store and if so, it will serve it, skipping the rest of the Rails stack. If it's not in the cache, then it'll continue along the Rails stack. As Rails returns the response, Rack::Cache will write the asset to the cache store, so on the next hit, it can serve it from that cache.

In my case, I'm using redis as my cache store via the [redis_store](https://github.com/jodosha/redis-store) gem, so Rack::Cache will write to redis with the full url as the key and the content as the body.

If you're not using a CDN, this might be just want you want. Your cache store will usually be faster than serving it from "public/assets" (via nginx, apache, Rails itself via ActionDispatc::Static) or [live compilation](http://guides.rubyonrails.org/asset_pipeline.html#live-compilation). This depends on your cache store of course. Redis, Memcached, or in memory stores will certainly be faster than hitting the disk. In our case, the CDN is going to be serving all these assets, so we don't need the Rack::Cache to store all these assets. The only time static assets will be requested from your Rails app is to seed the CDN.

##So how do I stop it?

We could disable the Rack::Cache middleware, like this:

```ruby
# config/application.rb
require 'rack/cache'

config.middleware.delete Rack::Cache
```

If you don't want to use Rack::Cache at all then this approach works fine. However, Rack::Cache can be extremely useful for http caching. If you're on Heroku and you use the Cedar stack, then Rack::Cache is recommended for http caching since Varnish isn't available. In this case, what we want is to just prevent static assets from being cached. Rack comes with a middleware for serving static assets called [Rack::Static](http://www.rubydoc.info/github/rack/rack/master/Rack/Static).

```ruby
# config/application.rb
require 'rack/cache'

if !Rails.env.development? && !Rails.env.test?
  config.middleware.insert_before Rack::Cache, Rack::Static, urls: [config.assets.prefix], root: 'public'
end
```

We can use this middleware in front of Rack::Cache specifically for any url requests that begin with the config.assets.prefix, which by default is "/assets". This should prevent Rack::Cache from polluting your cache storage with static assets.

There's also some additional information at my [StackOverflow](http://stackoverflow.com/q/6962896/68255) post. I also opened an [issue](https://github.com/rails/rails/issues/2468) on the Rails bug tracker.
