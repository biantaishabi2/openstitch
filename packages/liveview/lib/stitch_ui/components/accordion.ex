defmodule StitchUI.Components.Accordion do
  use Phoenix.Component

  attr :type, :string, default: nil
  attr :collapsible, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def accordion(assigns) do
    ~H"""
    <div data-slot="accordion" data-type={@type} data-collapsible={@collapsible} class={@class} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :value, :string, default: nil
  attr :active_value, :string, default: nil
  attr :active_values, :list, default: nil
  attr :open, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def accordion_item(assigns) do
    open_state =
      cond do
        assigns.open -> true
        assigns.active_value && assigns.value == assigns.active_value -> true
        is_list(assigns.active_values) && assigns.value in assigns.active_values -> true
        true -> false
      end

    assigns =
      assigns
      |> assign(:open_state, open_state)
      |> assign(:state, if(open_state, do: "open", else: "closed"))

    ~H"""
    <details
      data-slot="accordion-item"
      data-value={@value}
      data-state={@state}
      class={["group border-b last:border-b-0", @class]}
      {@rest}
      open={@open_state}
    >
      <%= render_slot(@inner_block) %>
    </details>
    """
  end

  attr :value, :string, default: nil
  attr :open, :boolean, default: false
  attr :on_toggle, :string, default: nil
  attr :target, :any, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def accordion_trigger(assigns) do
    state = if(assigns.open, do: "open", else: "closed")

    assigns =
      assigns
      |> assign(:state, state)
      |> assign(:click_value, if(assigns.on_toggle, do: assigns.value, else: nil))

    ~H"""
    <summary
      data-slot="accordion-trigger"
      data-state={@state}
      phx-click={@on_toggle}
      phx-target={@target}
      phx-value-item={@click_value}
      class={["focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180", @class]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
      <svg
        class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 group-open:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </summary>
    """
  end

  attr :open, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def accordion_content(assigns) do
    assigns = assign(assigns, :state, if(assigns.open, do: "open", else: "closed"))

    ~H"""
    <div
      data-slot="accordion-content"
      data-state={@state}
      class={[
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm",
        @class
      ]}
      {@rest}
    >
      <div class="pt-0 pb-4">
        <%= render_slot(@inner_block) %>
      </div>
    </div>
    """
  end
end
