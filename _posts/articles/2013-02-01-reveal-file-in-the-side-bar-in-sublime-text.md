---
layout: post
title: "Reveal file in the side bar in Sublime Text"
excerpt: ""
comments: true
category: articles
tags: [sublime]
---

This week I checked out Sublime Text 3 and it's definitely a lot snappier to start up and do global searches than ST2. There's also a branch of [Package Control](http://wbond.net/sublime_packages/package_control/installation#ST3) in alpha that mostly works with ST3. I found that a lot of the syntax bundles and tm-bundle ports worked out of the box, but some packages still require developers to port their code to Python 3.

So, when I was porting my settings over, I noticed a useful keybinding that I had forgotten wasn't built into Sublime. TextMate had this feature where you can Command + Control + R and it'd locate the file you're working on in the sidebar. I use this so often I thought I'd share this. Here's how you do it. Open `Menu > Sublime Text > Preferences > Key Bindings - User` and paste the following snippet:

```javascript
[
  { "keys": ["super+ctrl+r"], "command": "reveal_in_side_bar" }
]
```

If you have other bindings you probably just want to add that hash into the JSON array instead of replacing the entire file.
