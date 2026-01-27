defmodule StitchUI.DemoComponents do
  use Phoenix.Component
  import Phoenix.Component, except: [link: 1]

  import StitchUI.Components.Basic, except: [link: 1]
  import StitchUI.Components.Card
  import StitchUI.Components.Breadcrumb
  import StitchUI.Components.Tabs
  import StitchUI.Components.Accordion
  import StitchUI.Components.Table
  import StitchUI.Components.List
  import StitchUI.Components.Timeline
  import StitchUI.Components.Statistic
  import StitchUI.Components.CodeBlock
  import StitchUI.Components.Markdown
  import StitchUI.Components.Forms
  import StitchUI.Components.Feedback
  import StitchUI.Components.Stepper
  import StitchUI.Components.Avatar
  import StitchUI.Components.Hero
  import StitchUI.Layouts.Core

  embed_templates "demo_components/*"

  def link(assigns), do: StitchUI.Components.Basic.link(assigns)
end
