defmodule StitchUI.Components.Timeline do
  use Phoenix.Component

  @size_classes %{
    "sm" => "gap-4",
    "md" => "gap-6",
    "lg" => "gap-8"
  }

  @icon_size_classes %{
    "sm" => %{container: "h-8 w-8", icon: "h-4 w-4"},
    "md" => %{container: "h-10 w-10", icon: "h-5 w-5"},
    "lg" => %{container: "h-12 w-12", icon: "h-6 w-6"}
  }

  @color_classes %{
    "primary" => "bg-primary text-primary-foreground",
    "secondary" => "bg-secondary text-secondary-foreground",
    "muted" => "bg-muted text-muted-foreground",
    "accent" => "bg-accent text-accent-foreground",
    "destructive" => "bg-destructive text-destructive-foreground"
  }

  @connector_color_classes %{
    "primary" => "bg-primary",
    "secondary" => "bg-secondary",
    "muted" => "bg-muted",
    "accent" => "bg-accent",
    "destructive" => "bg-destructive"
  }

  @status_color_map %{
    "completed" => "primary",
    "in-progress" => "accent",
    "pending" => "muted",
    "error" => "destructive"
  }

  attr :size, :string, default: "md"
  attr :iconsize, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def timeline(assigns) do
    assigns = assign(assigns, :size_class, Map.get(@size_classes, assigns.size, "gap-6"))

    ~H"""
    <ol
      aria-label="Timeline"
      class={["flex flex-col relative w-full max-w-2xl mx-auto py-8", @size_class, @class]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </ol>
    """
  end

  attr :date, :string, default: nil
  attr :title, :string, default: nil
  attr :description, :string, default: nil
  attr :status, :string, default: "completed"
  attr :icon_color, :string, default: nil
  attr :iconsize, :string, default: "md"
  attr :show_connector, :boolean, default: true
  attr :class, :string, default: nil
  attr :rest, :global
  slot :icon
  slot :inner_block

  def timeline_item(assigns) do
    size = assigns.iconsize || "md"
    size_config = Map.get(@icon_size_classes, size, @icon_size_classes["md"])
    status_color = Map.get(@status_color_map, assigns.status, "primary")
    icon_color = assigns.icon_color || status_color
    color_class = Map.get(@color_classes, icon_color, @color_classes["primary"])
    aria_current = if assigns.status == "in-progress", do: "step", else: nil

    assigns =
      assigns
      |> assign(:icon_container_class, size_config.container)
      |> assign(:icon_inner_class, size_config.icon)
      |> assign(:color_class, color_class)
      |> assign(:aria_current, aria_current)

    ~H"""
    <li class={["relative w-full mb-8 last:mb-0", @class]} {@rest}>
      <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-start" aria-current={@aria_current}>
        <div class="flex flex-col justify-start pt-1">
          <time class="text-sm font-medium tracking-tight text-muted-foreground text-right pr-4"><%= @date || "" %></time>
        </div>
        <div class="flex flex-col items-center">
          <div class="relative z-10">
            <div
              class={[
                "relative flex items-center justify-center rounded-full ring-8 ring-background shadow-sm",
                @icon_container_class,
                @color_class
              ]}
            >
              <%= if @icon != [] do %>
                <div class={["flex items-center justify-center", @icon_inner_class]}>
                  <%= render_slot(@icon) %>
                </div>
              <% else %>
                <div class={["rounded-full", @icon_inner_class]}></div>
              <% end %>
            </div>
          </div>
          <%= if @show_connector do %>
            <div class="h-16 w-0.5 bg-border mt-2"></div>
          <% end %>
        </div>
        <div class="flex flex-col gap-2 pl-2">
          <div class="flex items-center gap-4">
            <%= if @title do %>
              <h3 class="font-semibold leading-none tracking-tight text-secondary-foreground"><%= @title %></h3>
            <% end %>
          </div>
          <%= if @description do %>
            <p class="max-w-sm text-sm text-muted-foreground"><%= @description %></p>
          <% end %>
          <%= if @inner_block != [] do %>
            <%= render_slot(@inner_block) %>
          <% end %>
        </div>
      </div>
    </li>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def timeline_content(assigns) do
    ~H"""
    <div class={["flex flex-col gap-2 pl-2", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def timeline_header(assigns) do
    ~H"""
    <div class={["flex items-center gap-4", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def timeline_title(assigns) do
    ~H"""
    <h3 class={["font-semibold leading-none tracking-tight text-secondary-foreground", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </h3>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def timeline_description(assigns) do
    ~H"""
    <p class={["max-w-sm text-sm text-muted-foreground", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </p>
    """
  end

  attr :date, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def timeline_time(assigns) do
    ~H"""
    <time class={["text-sm font-medium tracking-tight text-muted-foreground", @class]} {@rest}>
      <%= if @inner_block != [] do %>
        <%= render_slot(@inner_block) %>
      <% else %>
        <%= @date %>
      <% end %>
    </time>
    """
  end

  attr :status, :string, default: "completed"
  attr :color, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global

  def timeline_connector(assigns) do
    color =
      cond do
        assigns.color -> assigns.color
        assigns.status == "in-progress" -> "gradient"
        true -> Map.get(@status_color_map, assigns.status, "primary")
      end

    class =
      case color do
        "gradient" -> "bg-gradient-to-b from-primary to-muted"
        value -> Map.get(@connector_color_classes, value, "bg-primary")
      end

    assigns = assign(assigns, :line_class, class)

    ~H"""
    <div class={[@line_class, "w-0.5", @class]} {@rest}></div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def timeline_empty(assigns) do
    ~H"""
    <div class={["flex flex-col items-center justify-center p-8 text-center", @class]} {@rest}>
      <p class="text-sm text-muted-foreground"><%= if @inner_block != [], do: render_slot(@inner_block), else: "No data" %></p>
    </div>
    """
  end
end
