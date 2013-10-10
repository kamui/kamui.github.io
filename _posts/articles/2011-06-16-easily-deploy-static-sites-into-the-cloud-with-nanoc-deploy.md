---
layout: post
title: "Easily deploy static sites into the cloud with Nanoc Deploy"
excerpt: ""
modified: 2011-07-14 15:27
comments: true
category: articles
tags: [nanoc, gems, heroku, cloud]
---

**Updated July 14, 2011: As of Nanoc 3.3, nanoc-deploy will be [integrated](https://github.com/ddfreyne/nanoc/commit/e4c7f16ea0fbb8a59eac8d33591b83b1915540ec) into nanoc core.**

Recently at work, we've needed to deploy some static websites. The designers had been hand coding these in raw html for months, but I thought it'd be great if we could bring in some [HAML](http://haml-lang.com/) and [SASS](http://sass-lang.com/) goodness since they've been using it extensively on our Rails apps. I've been dabbling with static website generators months ago for my parent's restaurant [website](http://shogunlegends.com). I looked at [Jekyll](https://github.com/mojombo/jekyll), [Toto](http://github.com/cloudhead/toto), and [StaticMatic](http://github.com/staticmatic/staticmatic), [Webby](http://webby.rubyforge.org/), but ultimately I found the best for me was [nanoc](http://nanoc.stoneship.org/). This was in part due to @h3rald [blogging](http://www.h3rald.com/articles/take-back-your-site-with-nanoc/) about it.

Jekyll is great, but it's mainly aimed at blogging. Toto was too simple. StaticMatic and Webby aren't actively maintained. Nanoc is pretty actively maintained and it's great for building any kind of static site, not just blogs.

<!-- more -->

## Why static site generators?

Static site generators allow you to write websites in a variety of templating languages such as HAML, SASS, Markdown, ERB, etc. and compile them down into static html files. This makes it great for brochure sites, blogs, and informational sites. Anything where you don't a web frontend to manage dynamic content. Since it's just html, css and js, it's FAST! There's also a variety of places you can host static websites since no programming language support is required.

## Deployment

I'm not going to go over the basics of nanoc since their [docs](http://nanoc.stoneship.org/docs/3-getting-started/) do a great job of that. However, I do want to talk a little bit about deployment strategies. Out of the box, nanoc has an rsync deployer. You provide the [rsync deployer](http://nanoc.stoneship.org/docs/6-guides/#deploying-sites) with a destination path (likely via ssh to a server) and it will call rsync from command line and sync the output folder (compiled site) with your remote destination. You just run a simple rask task like this:

```bash
$ rake deploy:rsync
```

This is great, and we use this at work by deploying our static sites to a [Linode](http://www.linode.com/) box.

We do actively use Amazon S3 and Rackspace Cloudfiles at work. There are situations where we have to deploy to those cloud storage solutions. You can kind of get rsync working with S3 via some 3rd party services or tools, but why do that when I can write a gem and make my own deployer with [fog](https://github.com/geemus/fog)?

# Introducing the Nanoc Cloud Deployer gem

So, I wrote a gem called [nanoc-deploy](https://github.com/kamui/nanoc-deploy) to solve this issue. This gem will add a deployer to nanoc that lets you deploy directly to Amazon S3, Rackspace Cloudfiles or Google Storage. Since fog has a nice single api for writing files into the cloud it should just support any provider that fog supports in the future.

So how do you install it? If you're using bundler, just add this to your Gemfile:

```ruby
# Gemfile
gem 'nanoc-deploy'
```

Otherwise, you can just install the gem manually:

```ruby
$ gem install nanoc-deploy
```

and then in your nanoc project, put this in Rakefile:

```ruby
require 'nanoc-deploy/tasks'
```

To configure it, in config.yaml:

```yaml
# config.yaml
deploy:
  default:
    provider:              aws
    bucket:                some-bucket-name
    aws_access_key_id:     your_id
    aws_secret_access_key: your_key
```

In this example, the provider is aws (s3). Valid values are "aws", "rackspace", or "google". The bucket is the s3 bucket name, or root directory for your data storage provider. The key/secret pair differ depending on your provider. In this case, we use aws_access_key_id/aws_secret_access_key because we're using s3.

If your provider is "rackspace":

```yaml
# config.yaml
deploy:
  default:
    provider:           rackspace
    rackspace_username: your_username
    rackspace_api_key:  your_key
```

If your provider is "google":

```yaml
# config.yaml
deploy:
  default:
    provider:                         google
    google_storage_secret_access_key: your_key
    google_storage_access_key_id:     your_id
```

You can set an optional path if you want a path prefix to your site. For example, the code
below:

```yaml
# config.yaml
deploy:
  default:
    path:  myproject
```

will produce a url similar to:

```bash
https://s3.amazonaws.com/some-bucket-name/myproject
```

If you check your rake tasks you should now see a deploy:cloud task:

```bash
$ rake -T
```

To deploy:

```bash
$ rake deploy:cloud
```

Now you can deploy any nanoc site directly to the cloud via command line. We haven't used it too extensively lately, since we've been moving the static sites on to Linode. So, if you have any problems/feature requests, you can post them on the [Github Issues](https://github.com/kamui/nanoc-deploy/issues) page.
