defmodule StitchUI.Components.Tabs do
  use Phoenix.Component

  attr :value, :string, default: nil
  attr :default_value, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tabs(assigns) do
    active = assigns.value || assigns.default_value
    assigns = assign(assigns, :active, active)

    ~H"""
    <div data-slot="tabs" data-value={@active} class={["flex flex-col gap-2", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tabs_list(assigns) do
    ~H"""
    <div
      data-slot="tabs-list"
      class={["bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]", @class]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :value, :string, required: true
  attr :active_value, :string, default: nil
  attr :state, :string, default: nil
  attr :on_change, :string, default: nil
  attr :target, :any, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tabs_trigger(assigns) do
    state =
      cond do
        assigns.state -> assigns.state
        assigns.active_value && assigns.value == assigns.active_value -> "active"
        true -> "inactive"
      end

    assigns =
      assigns
      |> assign(:state, state)
      |> assign(:click_event, assigns.on_change)
      |> assign(:click_value, if(assigns.on_change, do: assigns.value, else: nil))

    ~H"""
    <button
      type="button"
      data-slot="tabs-trigger"
      data-value={@value}
      data-state={@state}
      phx-click={@click_event}
      phx-target={@target}
      phx-value-tab={@click_value}
      class={[
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  attr :value, :string, required: true
  attr :active_value, :string, default: nil
  attr :state, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tabs_content(assigns) do
    state =
      cond do
        assigns.state -> assigns.state
        assigns.active_value && assigns.value == assigns.active_value -> "active"
        true -> "inactive"
      end

    assigns =
      assigns
      |> assign(:state, state)
      |> assign(:hidden, state != "active")

    ~H"""
    <div
      data-slot="tabs-content"
      data-value={@value}
      data-state={@state}
      hidden={@hidden}
      class={["flex-1 outline-none", @class]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end
end
