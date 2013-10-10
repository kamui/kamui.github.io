---
layout: post
title: "Automated Heroku Database Backups to Amazon S3"
excerpt: ""
comments: true
category: articles
tags: [heroku, heroku_backup_task, gems, ruby on rails]
---

At work, we've recently switched from Engine Yard AppCloud to Heroku. One of the things we've been missing is daily database dumps. Heroku does provide you with an addon called [PG Backups](http://devcenter.heroku.com/articles/pgbackups). The basic free version will retain 2 postgres backups, which you have to kick off manually.

There's a gem created by [@ddollar](https://twitter.com/#!/ddollar) (now maintained by [joemsak](https://github.com/joemsak)) called [heroku_backup_task](https://github.com/joemsak/heroku_backup_task). This gem adds a rake task that captures a new database backup in the PG Backup addon and expires the oldest one.

<!-- more -->

Here's how you install it:

```ruby
# Gemfile
gem "heroku_backup_task"
```

```ruby
# Rakefile
require "heroku_backup_task/tasks"
task :cron => :heroku_backup
```

If you enable the basic [cron addon](http://addons.heroku.com/cron), it'll run this daily and you'll always have the last 2 days worth of PG backups. That's great, but I want more than the last 2 days worth.

To solve this problem, I originally forked the [heroku_tools](https://github.com/kamui/heroku_tools) project, fixing a few bugs, but this was just a rake task you had to include manually and it only supported s3. Then I forked [heroku_s3_backup](https://github.com/kamui/heroku_s3_backup) and swapped out right_aws for fog, mainly because I wanted to learn how to use the fog gem. This worked better since it was gemified, but the name tied it to s3. So I set out to create a new gem.

# Introducing Heroku Cloud Backup#

The [heroku_cloud_backup](https://github.com/kamui/heroku_cloud_backup) gem also adds a rake task to your project, but supports all the cloud storage providers that fog supports. It's also a lot more configurable through the heroku config. The heroku:cloud_backup task, when called, will upload the latest PG Backup capture to the cloud using [fog](https://github.com/geemus/fog/). Currently, it supports Amazon S3, Rackspace Cloud Files, and Google Storage.

## Installation

It's recommended that you use this gem in conjunction with the heroku_backup_task gem. First, you need to enable the Heroku PGBackups addon:

```bash
$ heroku addons:add pgbackups:basic
```

If you want this to run daily, you'll need to enable the Heroku cron addon:

```bash
$ heroku addons:add cron:daily
```

For Rails 3.x, add this to your Gemfile:

```ruby
# Gemfile
gem 'heroku_backup_task'
gem 'heroku_cloud_backup'
```

For Rails 2.x, add this to your in your environment.rb:

```ruby
# config/environment.rb
config.gem 'heroku_backup_task'
config.gem 'heroku_cloud_backup'
```

In your Rakefile:

```ruby
# Rakefile
require "heroku_backup_task"
require "heroku_cloud_backup"

task :cron do
  HerokuBackupTask.execute
  HerokuCloudBackup.execute
end
```

## Usage

The first thing you'll want to do is configure the addon.

HCB_PROVIDER (aws, rackspace, google) - Add which provider you're using. **Required**

```bash
$ heroku config:add HCB_PROVIDER='aws' # or 'google' or 'rackspace'
```

HCB_BUCKET (alphanumberic characters, dashes, period, underscore are allowed, between 3 and 255 characters long) - Select a bucket name to upload to. This the bucket or root directory that your files will be stored in. If the bucket doesn't exist, it will be created. **Required**

```bash
$ heroku config:add HCB_BUCKET='mywebsite'
```

HCB_PREFIX (Defaults to "db") - The direction prefix for where the backups are stored. This is so you can store your backups within a specific sub directory within the bucket. heroku_cloud_backup will also append the ENV var of the database to the path, so you can backup multiple databases, by their ENV names. **Optional**

```bash
$ heroku config:add HCB_PREFIX='backups/pg'
```

HCB_MAX (Defaults to no limit) - The number of backups to store before the script will prune out older backups. A value of 10 will allow you to store 10 of the most recent backups. Newer backups will replace older ones. **Optional**

```bash
$ heroku config:add HCB_MAX=10
```

Depending on which provider you specify, you'll need to provide different login credentials.

For Amazon:

```bash
$ heroku config:add HCB_KEY1="aws_access_key_id"
$ heroku config:add HCB_KEY2="aws_secret_access_key"
```

For Rackspace:

```bash
$ heroku config:add HCB_KEY1="rackspace_username"
$ heroku config:add HCB_KEY2="rackspace_api_key"
```

For Google Storage:

```bash
$ heroku config:add HCB_KEY1="google_storage_secret_access_key"
$ heroku config:add HCB_KEY2="google_storage_access_key_id"
```

You can run this manually like this:

```bash
$ heroku rake heroku_backup
$ heroku rake heroku:cloud_backup
```

## How do I go about restoring a backup?

I would recommend you create a temporarily public url from your cloud storage. I do this with Cyberduck. It has a neat feature where you can right click on a file and it'll generate temporarily accessible urls to that file, with the auth params for it. So once you have that url you can store like this:

```bash
$ heroku pgbackups:restore SHARED_DATABASE 'http://bucket.s3.amazonaws.com/db/2011-06-09-014500.dump?authparameters'
```

Hopefully this gem will be of use to someone. If you have any problems or feature requests, you can post them on the [Github Issues](https://github.com/kamui/heroku_cloud_backup/issues) page set up for the project.
