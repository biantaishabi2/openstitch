defmodule StitchUI.Components.Feedback do
  use Phoenix.Component

  @alert_variants %{
    "default" => "bg-card text-card-foreground",
    "destructive" =>
      "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90"
  }

  @badge_variants %{
    "default" => "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
    "secondary" => "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
    "destructive" =>
      "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
    "outline" => "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
  }

  attr :variant, :string, default: "default"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def alert(assigns) do
    assigns = assign(assigns, :variant_class, alert_variant_class(assigns.variant))

    ~H"""
    <div
      data-slot="alert"
      role="alert"
      class={[
        "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
        @variant_class,
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def alert_title(assigns) do
    ~H"""
    <h5 data-slot="alert-title" class={["col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </h5>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def alert_description(assigns) do
    ~H"""
    <div data-slot="alert-description" class={["text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :variant, :string, default: "default"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def badge(assigns) do
    assigns = assign(assigns, :variant_class, badge_variant_class(assigns.variant))

    ~H"""
    <span
      data-slot="badge"
      class={[
        "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
        @variant_class,
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </span>
    """
  end

  attr :value, :integer, default: 0
  attr :class, :string, default: nil
  attr :rest, :global

  def progress(assigns) do
    percent = assigns.value || 0
    assigns = assign(assigns, :percent, percent)

    ~H"""
    <div data-slot="progress" class={["bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", @class]} {@rest}>
      <div data-slot="progress-indicator" class="bg-primary h-full w-full flex-1 transition-all" style={"transform: translateX(-#{100 - @percent}%)"}></div>
    </div>
    """
  end

  attr :open, :boolean, default: nil
  attr :default_open, :boolean, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def dialog(assigns) do
    ~H"""
    <div data-slot="dialog" class={@class} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def dialog_trigger(assigns) do
    ~H"""
    <button data-slot="dialog-trigger" type="button" class={@class} {@rest}>
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def dialog_content(assigns) do
    ~H"""
    <div
      data-slot="dialog-content"
      class={[
        "bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-lg border p-6 shadow-lg",
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def dialog_header(assigns) do
    ~H"""
    <div data-slot="dialog-header" class={["flex flex-col gap-2 text-center sm:text-left", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def dialog_footer(assigns) do
    ~H"""
    <div data-slot="dialog-footer" class={["flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def dialog_title(assigns) do
    ~H"""
    <h3 data-slot="dialog-title" class={["text-lg leading-none font-semibold", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </h3>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def dialog_description(assigns) do
    ~H"""
    <p data-slot="dialog-description" class={["text-muted-foreground text-sm", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </p>
    """
  end

  attr :open, :boolean, default: nil
  attr :default_open, :boolean, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip(assigns) do
    ~H"""
    <span data-slot="tooltip" class={@class} {@rest}>
      <%= render_slot(@inner_block) %>
    </span>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip_provider(assigns) do
    ~H"""
    <span data-slot="tooltip-provider" class={@class} {@rest}>
      <%= render_slot(@inner_block) %>
    </span>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip_trigger(assigns) do
    ~H"""
    <span data-slot="tooltip-trigger" class={@class} {@rest}>
      <%= render_slot(@inner_block) %>
    </span>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip_content(assigns) do
    ~H"""
    <span data-slot="tooltip-content" class={["rounded-md border bg-popover px-3 py-1.5 text-sm shadow-md", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </span>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global

  def skeleton(assigns) do
    ~H"""
    <div data-slot="skeleton" class={["bg-accent animate-pulse rounded-md", @class]} {@rest}></div>
    """
  end

  @empty_state_defaults %{
    "default" => %{title: "No content", description: "There is nothing to display", icon: "inbox"},
    "no-data" => %{title: "No data", description: "No records yet", icon: "file-x"},
    "no-results" => %{title: "No results", description: "No matches found", icon: "search"},
    "empty-folder" => %{title: "Empty folder", description: "This folder has no files", icon: "folder-open"}
  }

  attr :type, :string, default: "default"
  attr :title, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :icon
  slot :action
  slot :inner_block

  def empty_state(assigns) do
    config = Map.get(@empty_state_defaults, assigns.type, @empty_state_defaults["default"])

    assigns =
      assigns
      |> assign(:config, config)
      |> assign(:resolved_title, assigns.title || config.title)
      |> assign(:resolved_description, assigns.description || config.description)

    ~H"""
    <div class={["flex flex-col items-center justify-center py-12 px-4 text-center", @class]} {@rest}>
      <div class="text-muted-foreground/50 mb-4">
        <%= if @icon != [] do %>
          <%= render_slot(@icon) %>
        <% else %>
          <%= empty_state_icon(@config.icon) %>
        <% end %>
      </div>
      <h3 class="text-lg font-medium text-foreground mb-2"><%= @resolved_title %></h3>
      <p class="text-sm text-muted-foreground max-w-sm mb-6"><%= @resolved_description %></p>
      <%= if @action != [] do %>
        <div><%= render_slot(@action) %></div>
      <% end %>
      <%= if @inner_block != [] do %>
        <%= render_slot(@inner_block) %>
      <% end %>
    </div>
    """
  end

  attr :orientation, :string, default: "horizontal"
  attr :class, :string, default: nil
  attr :rest, :global

  def separator(assigns) do
    ~H"""
    <div
      data-slot="separator"
      class={[
        "bg-border shrink-0",
        @orientation == "horizontal" && "h-px w-full" || "h-full w-px",
        @class
      ]}
      {@rest}
    ></div>
    """
  end

  defp alert_variant_class(nil), do: nil
  defp alert_variant_class(value), do: Map.get(@alert_variants, value)

  defp badge_variant_class(nil), do: nil
  defp badge_variant_class(value), do: Map.get(@badge_variants, value)

  defp empty_state_icon(type) do
    assigns = %{type: type}

    ~H"""
    <%= case @type do %>
      <% "file-x" -> %>
        <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <path d="M14 2v6h6" />
          <path d="m14.5 12.5-5 5" />
          <path d="m9.5 12.5 5 5" />
        </svg>
      <% "search" -> %>
        <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21 21-4.34-4.34" />
          <circle cx="11" cy="11" r="8" />
        </svg>
      <% "folder-open" -> %>
        <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 14 1.5-6h9l1.5 6" />
          <path d="M2 12V6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v6" />
        </svg>
      <% _ -> %>
        <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
    <% end %>
    """
  end
end
