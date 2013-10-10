---
layout: post
title: "Named Parameter Scopes and form_for"
excerpt: ""
comments: true
category: articles
tags: [ruby on rails]
---

I'm working on a Rails 3 app that hosts many projects and every resource within the app is scoped by a project. So wallpapers, videos, polls, etc. belong to a project. Ideally, I want my routes also scoped by a project. It's easy to configure nested resources that give you routes that look like:

```ruby
/projects/:project_name/videos
```

But since everything is scoped by the project name, why don't I just drop the /projects prefix?

```ruby
# config/routes.rb
scope ':project_name' do
  resources :videos
end
```

So this gives us params['project_name'] in each video action. Now our routes can look like this:

```ruby
/:project_name/videos
```

<!-- more -->

##Access to the Project

You might want access to a @project instance variable in every controller nested within this project scope. If so, you can add this in application_controller.rb:

```ruby
# app/controllers/application_controller.rb
before_filter :load_project

protected

def load_project
  project_name = params[:project_name]
  @project = project_name ? Project.where(:name => project_name).first : nil
end
```

##A Caveat

However, a caveat with this is that it breaks simple form_for helpers.

If you had this in your _form.html.haml partial:

```ruby
# _form.html.haml
= form_for @video do |f|
```

This will now return a RoutingError because the routes expect a :project_name that no longer exists. The fix for this turns out to be a little more complex.

```ruby
= form_for @video, :url => @video.persisted? ? video_path(@project.name, @video) : videos_path(@project.name) do |f|
```

Since you can't rely on the generic form_for, you now need to be explicit about your url. It's not as terse, but it'll work for creating and updating a resource.
