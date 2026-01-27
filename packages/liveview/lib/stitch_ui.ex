defmodule StitchUI do
  @moduledoc """
  Stitch UI LiveView components.
  """

  defmacro __using__(_opts) do
    quote do
      import StitchUI.Components.Basic
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
    end
  end
end
