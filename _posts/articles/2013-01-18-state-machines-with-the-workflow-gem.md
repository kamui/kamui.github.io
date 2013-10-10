---
layout: post
title: "State machines with the Workflow gem"
excerpt: "Quick look at ruby state machines and the workflow gem."
comments: true
category: articles
tags: [workflow, ruby, sequel]
---

Recently, I've needed to add some state machine functionality in some of my models. So, the first thing I did was check out various ruby state machine gems on the [Ruby Toolbox](https://www.ruby-toolbox.com/categories/state_machines.html). I prefer [Sequel](https://github.com/jeremyevans/sequel) over `ActiveRecord`, but almost all of the gems listed only provide adapters for `ActiveRecord` or `Mongoid`. The amount of effort to write a `Sequel` adapter is definitely something to consider for me.

[state_machine](https://github.com/pluginaweek/state_machine) is the gorilla of state machine gems. It has tons of features, adapters for `ActiveRecord`, `DataMapper`, `Mongoid`, `MongoMapper`, and `Sequel`, but can be overkill for simple uses cases. I don't need multiple state machines per class, event parallelization, namespacing, etc. However, having generated Graphiz visualizations can be invaluable when you have complicated state transitions. I've actually used `state_machine` before, but I do feel it's too heavy for my needs.

[AASM](https://github.com/aasm/aasm) has been around for years and has adapters for `ActiveRecord` and `Mongoid`. It's relatively light, but it doesn't have a `Sequel` adapter and from looking at the `ActiveRecord` adapter, it seems like it'd be a little work to write one.

[Transitions](https://github.com/troessner/transitions) is the state machine extracted from `ActiveModel`. It's super simple, but requires `ActiveModel` compliance. For `Sequel` support, there is a a [ActiveModel plugin](http://sequel.rubyforge.org/rdoc-plugins/classes/Sequel/Plugins/ActiveModel.html) that provides this. I attempted this solution first, but ran into an `after_initialize` exception, which I believe is an `ActiveRecord` specific hook.

"[Workflow](https://github.com/geekq/workflow) is a finite-state-machine-inspired API for modeling and interacting with what we tend to refer to as 'workflow'." The API is similar to the other 3, but the immediate difference is that you define events and transitions in the context of the state. When I used `state_machine`, events were defined separately from states and therefore you could reuse the same event definitions. `Workflow` is pretty lightweight at about 500 loc and as a bonus, also supports generating Graphviz visualizations. `Workflow` doesn't have a `Sequel` adapter, but it looks like adding support only requires defining 2 methods.

All these gems provide, states, transitions, events, generated predicates and hooks, but I decided to go with `Workflow` because it was lightweight and it seemed like the easiest to write a `Sequel` adapter for. I also have some complicated flows, and the Graphviz diagrams can help a lot in visualizaing transitions.

## workflow_sequel_adapter

To write a persistence adapter for `Workflow` is fairly straightforward. Override `load_workflow_state` and `persist_workflow_state(new_value)` methods in the class. I packaged it into a gem, [workflow_sequel_adapter](https://github.com/kamui/workflow_sequel_adapter). To use it, just add this to your Gemfile:

```ruby
gem 'workflow_sequel_adapter'
```

and then in your class, `include WorkflowSequelAdapter`:

```ruby
class Something < Sequel::Model
  include Workflow
  include WorkflowSequelAdapter

  # code here
end
```

## Using Workflow

So, how do you use `Workflow`? Well, here's one simple use case. A `User` model starts in an `unconfirmed` state. When the user signs up, they get a confirmation email with a link to confirm their account. When they click on that link, the `confirm` event is triggered, and the state transitions to `active`. While `active`, the event `deactivated` can be triggered, which will transition the state to `inactive`.

The code looks similar to this:

```ruby
require 'bcrpyt'
require 'secure_token'

class User < Sequel::Model
  include BCrypt # for password encryption
  include Workflow # for workflow block
  include WorkflowSequelAdapter # for workflow sequel persistence

  set_allowed_columns :email, :password # allow email and password to be set via mass assignment

  workflow_column :state # use 'state' as the workflow column instead of 'workflow_state'

  workflow do
    state :unconfirmed do
      event :confirm, transition_to: :active
    end

    state :active do
      event :deactivate, transition_to: :inactive
    end

    state :inactive do
      event :activate, transition_to: :active
    end
  end

  # if you define a method with the same name as the event name, it'll be invoked after the transition
  # this will clear the confirmation_token after a user is confirmed
  def confirm
    self.confirmation_token = nil
    self.save_changes
  end

  # equivalent of ActiveRecord scopes for each state
  subset :unconfirmed, state: 'unconfirmed'
  subset :active, state: 'active'
  subset :inactive, state: 'inactive'

  # singleton method to authenticate based on email, password
  def self.authenticate(email, unencrypted_password)
    user = self[email: email, state: 'active']
    user if user && user.password == unencrypted_password
  end

  def password
    @password ||= Password.new(encrypted_password)
  end

  def password=(new_password)
    @password = Password.create(new_password)
    self.encrypted_password = @password
  end

  # generate unique confirmation token after create
  def after_create
    super
    self.confirmation_token = generate_confirmation_token
    self.save_changes
  end

  def validate
    super
    validates_presence [:email, :encrypted_password]
    validates_unique :email, :confirmation_token
  end

  private
  def generate_confirmation_token
    record = true
    while record
      token = SecureToken.generate
      record = self.class[confirmation_token: token]
    end
    token
  end
end
```

State predicates are also generated so you can tell which events can be triggered:

```ruby
user = User.create(email: 'email@example.com', 'SomePassword123')
user.can_confirm? # returns true
user.can_deactivate? # returns false
```

Triggering an event is just invoking the event name as a method with a bang:

```ruby
user.confirm!
user.confirmed? # returns true
```

Well, those are the basics. The [Workflow GitHub README](https://github.com/geekq/workflow) does a pretty good job documenting how to use `Workflow`. I hope this short intro on how I use `Workflow` and my `Sequel` adapter helps someone.
