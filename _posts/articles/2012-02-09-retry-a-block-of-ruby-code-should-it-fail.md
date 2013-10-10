---
layout: post
title: "Retry a block of Ruby code should it fail"
excerpt: ""
modified: 2013-09-14 21:03
comments: true
category: articles
tags: [ruby, gems]
---

I have a piece of code that needs to remove (rm -rf) a directory, but sometimes  [FileUtils#rm_rf](http://ruby-doc.org/stdlib-1.9.3/libdoc/fileutils/rdoc/FileUtils.html#method-c-rm_r) will fail and return an Errno::ENOENT with the message "Directory not empty." Maybe a file in that directory is locked by the OS, but for whatever reason, it can fail. So in such a case, I retry it a few times and exit if it fails to remove that directory after those attempts.


The code might be familiar, it looks like this:

```ruby
directory = Pathname.new("/path/to/somewhere")
retry_count = 0
begin
  FileUtils.rm_r(directory)
rescue Errno::ENOENT => e
  retry_count += 1
  if retry_count > 3
    raise
  else
    retry
  end
end
```

The retry counting and incrementing bit can be verbose and if you need similar functionality elsewhere in your code,  it can get kind of messy. I have another piece of code that uses [Grit](https://github.com/mojombo/grit) to clone a git repo and that can time out so I retry that code a few times too. This type of retry code can be useful when accessing external apis or anything that can possibly time out that you might want to retry.

<!-- more -->

Instead of extracting this into my own gem, what I usually do is search [GitHub](https://github.com), [RubyGems](https://rubygems.org/), and [Ruby Toolbox](ruby-toolbox.com) to see if there's already a gem with the functionality I need. There were a few that hadn't been updated in years, but the most interesting seemed to be [Robert Sosinski](https://github.com/robertsosinski)'s [retryable-rb gem](https://github.com/robertsosinski/retryable). This gem introduces a #retryable method, which takes a code block and arguments, such as an array of Exceptions to retry on, a number of attempts, sleep time, and even callbacks that are called on each failed attempt, after all failed attempts, or after a pass or all failed attempts. Pretty useful right?

My only issue with this gem is that you need to include the Retryable module in the class you need to use it in, or you need to call it via the Retryable module. You end up using it like this:

```ruby
require 'retryable'
class Api
  include Retryable

  def get
    retryable do
      # code here...
    end
  end
end

# or like this
Retryable.retryable do
  # code here...
end
```

I think retryable should extend the Kernel module. It should act like a built-in Ruby construct. You shouldn't have to worry about including the module in your class or accessing it via the Retryable module. So I [forked it](https://github.com/kamui/retriable).

##Retriable Gem

Intially the only thing it added was extending the Kernel module so you can use it anywhere. Eventually, I just rewrote it, making the Kernel extension an option, changing the API, adding a timeout option, and other changes. Based on Lonny Eachus' comment I've released my fork under the [Retriable](https://rubygems.org/gems/retriable) gem name. So you can now use it like this:

```ruby
retriable on: [Timeout::Error], tries: 3, interval: 1 do
  FileUtils.rm_rf(directory)
  raise Timeout::Error, "Couldn't delete asset path: #{directory}" if Dir.exists?(directory)
end
```

If you want the same functionality in your ruby code all you need to do is add it to your Gemfile like so:

```ruby
gem 'retriable'
```

I know some people don't like polluting Kernel with methods, so if you want the non Kernel version, you can do this:

```ruby
gem 'retriable', require => 'retriable/no_kernel'
```

In this case, you'll just execute a retriable block from the Retriable module:

```ruby
Retriable.retriable do
  # code here...
end
```

If you're interested, check out the rest of the [docs](https://github.com/kamui/retriable).
