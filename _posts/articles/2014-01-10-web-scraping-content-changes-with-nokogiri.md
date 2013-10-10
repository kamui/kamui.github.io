---
layout: post
title: Web scraping content changes with Nokogiri
excerpt: "A web scraping script that will look for content changes on a website and notify you of the changes."
category: articles
tags: [nokogiri, ruby]
comments: true
share: true
---

Over the holidays there were tons of sales all over the internet and the best things sold out super __quick__! I missed out on some clothing deals I really wanted. So, post holidays I've been monitoring those same items I wanted, waiting for the inevitable returns to come into stock, hopefully in my size.

After about a week I got tired of refreshing my many Chrome tabs and decided to write a quick web scraper in ruby. It mainly takes a URL, a CSS selector, and time interval as input and it'll run the script continuously looking for content changes. On a change you can configure it to email you or it'll just print the change to stdout.

Nokogiri has some [requirements](http://nokogiri.org/tutorials/installing_nokogiri.html), so check for your platform requirements.

Install `nokogiri` and `pony`:

```sh
gem install nokogiri
gem install pony
```

[Download the gist](https://gist.github.com/kamui/8347721/download) or copy the gist contents into `web_scrape.rb`:

To run the script:

```sh
$ ruby web_scrape.rb
```
Here's the code. I've genericized the script to check for Google doodle changes.

```ruby
require 'nokogiri'
require 'open-uri'
require 'pony'
require 'digest'

URL = 'https://encrypted.google.com/'.freeze
CSS_SELECTOR = '#lga'.freeze
INTERVAL = 600.freeze
USER_AGENT = "Ruby/#{RUBY_VERSION}".freeze
SEND_EMAIL = false
MAIL_FROM = 'u1@example.com'.freeze
MAIL_TO = 'u2@example.com'.freeze
MAIL_OPTIONS = {
  address:               'smtp.gmail.com',
  port:                  '587',
  enable_starttls_auto:  true,
  user_name:             'user',
  password:              'password',
  authentication:        :plain, # :plain, :login, :cram_md5, no auth by default
  domain:                "localhost.localdomain" # the HELO domain provided by the client to the server
}.freeze

Pony.options = {
  from: MAIL_FROM,
  via: :smtp,
  via_options: MAIL_OPTIONS
}

target_digest = nil

while(true) do
  doc = Nokogiri::HTML(open(URL, 'User-Agent' => USER_AGENT))
  content = doc.css(CSS_SELECTOR).first
  content_digest = Digest::MD5.new.digest(content.to_s)

  if target_digest.nil?
    target_digest = content_digest
    puts "#{Time.now}: Seeded content: #{content}"
  elsif content_digest.strip != target_digest.strip
    puts "#{Time.now}: #{content}"
    Pony.mail({
      to:   MAIL_TO,
      subject: "Web Scrape Script: Target website has been updated!",
      body:  "Target URL: #{URL}\n\nChange: #{content}"
    }) if SEND_EMAIL
    target_digest = content_digest
  else
    puts "#{Time.now}: No change"
  end

  sleep INTERVAL
end
```

To config, just modify the constants at the top. By default, the `SEND_EMAIL` config is off, so if you want email notifications make sure to set it to true. I have it configured by default for gmail. I generated an application specific password for my script so I can revoke it when I'm done and not worry about passwords in plaintext on my file system.

# How it works

So [nokogiri](http://nokogiri.org) is mainly doing the heavy work. It'll open the URL you set, use your CSS selector to find the node you're after. For clothing items, I've been targeting the sizes section of the page. I'll grab the html from just that node, get the md5 digest of that content and store it. Then it'll sleep for the `INTERVAL` duration in seconds, and on the next cycle it'll repeat the process, this time checking to see if that stored md5 digest has changed.

If there's a change, it'll send a notification, update it's internal digest so it can keep comparing future page updates against the most current page content. So you can just let it keep running and it'll notify you of all future changes to the node on that page.

If there's no change, it'll sleep for the `INTERVAL` and try again.

If you want to quit, just `Ctrl + C` it.

Maybe later I'll add some more error checking, like if the page 404's or 500's.

Enjoy!
