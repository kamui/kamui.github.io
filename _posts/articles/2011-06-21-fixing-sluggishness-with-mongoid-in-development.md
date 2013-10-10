---
layout: post
title: "Fixing Sluggishness with Mongoid in Development"
excerpt: ""
modified: 2011-06-22 15:27
comments: true
category: articles
tags: [ruby on rails, mongoid]
---

I've been migrating a project from Postgres to MongoDB, where dynamic fields would help tremendously. We went with [Mongoid](http://mongoid.org/) for our ORM since it seems to have the most support and activity on Github. However, one thing I've noticed after migrating all my models is that the app was instantly slower. Everything felt sluggish, but when I deployed  to a staging box, everything was fast and snappy. One of the first things I started to do was to switch on some production environment settings to see if some of these flags could give me a hint as to what the issue was.

<!-- more -->

So, development.rb:

```ruby
# config/environments/development.rb
config.cache_classes = true
```

It turns out this instantly fixed the slowness. However, I can't turn this on in development, or I'd end up having to restart the rails server every time I made a code change. Digging deeper into the Mongoid docs:

> In order to properly set up single collection inheritance, Mongoid needs to preload all models before every request in development mode. This can get slow, so if you are not using any inheritance it is recommended you turn this feature off.
>
> config.mongoid.preload_models = false
>
> [Mongoid Documentation](http://mongoid.org/docs/rails/railties.html)


It turns out that by default, Mongoid preloads all my models to handle single collection inheritance. This isn't a huge deal in production, since it only happens once, but in development it's preloading all my models on every request. Since I don't use SCI in my app I figured I'd try to turn this off.

So, I added:

```ruby
# config/mongoid.yml
preload_models: false
```

to the development environment. This seemed to do the trick. If you're having sluggishness with Mongoid in development, then give this a shot.

**Updated on June 22nd, 2011:**

I was taking a look at the [MongoMapper](http://mongomapper.com/), a competing MongoDB ORM, and noticed they mentioned [single collection inheritance](http://mongomapper.com/documentation/plugins/single-collection-inheritance.html). Apparently I'd confused it with class inheritance since I hadn't seen it explained in the Mongoid docs. Here's the explanation from the link:

> Single Collection Inheritance (&ldquo;SCI&rdquo;) allows you to store multiple types of similar documents into a single collection. The most common case is when you have a hierarchy of objects that inherit behavior and attributes.
>
> [MongoMapper Documentation](http://mongomapper.com/documentation/plugins/single-collection-inheritance.html)

```ruby
class Field
  include MongoMapper::Document
  key :name, :required => true
end

class FileUpload &lt; Field
  plugin Joint
  attachment :file
  validates_length_of :file_size, :minimum => 0, :maximum => 10.megabytes
end

class TextField &lt; Field
end

class RadioButton &lt; Field
  many :options
end
```

If you need to use a **has_many** association on a polymorphic model that inherits from a base class, then you'll need to keep preload_moels enabled. Otherwise, you can turn it off and see a performance increase in development.
