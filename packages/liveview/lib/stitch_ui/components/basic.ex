defmodule StitchUI.Components.Basic do
  use Phoenix.Component

  @variant_styles %{
    "default" => "text-base text-foreground",
    "title" => "text-2xl font-bold text-foreground",
    "subtitle" => "text-lg font-medium text-foreground",
    "muted" => "text-sm text-muted-foreground",
    "small" => "text-xs text-muted-foreground",
    "large" => "text-xl text-foreground"
  }

  @size_map %{
    "xs" => "h-3 w-3",
    "sm" => "h-4 w-4",
    "md" => "h-5 w-5",
    "lg" => "h-6 w-6",
    "xl" => "h-8 w-8"
  }

  @icon_nodes %{
    "Home" => [
      {"path", %{"d" => "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"}},
      {"path",
       %{
         "d" =>
           "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
       }}
    ],
    "Settings" => [
      {"path",
       %{
         "d" =>
           "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
       }},
      {"circle", %{"cx" => "12", "cy" => "12", "r" => "3"}}
    ],
    "User" => [
      {"path", %{"d" => "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"}},
      {"circle", %{"cx" => "12", "cy" => "7", "r" => "4"}}
    ],
    "Mail" => [
      {"path", %{"d" => "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"}},
      {"rect", %{"x" => "2", "y" => "4", "width" => "20", "height" => "16", "rx" => "2"}}
    ],
    "Bell" => [
      {"path", %{"d" => "M10.268 21a2 2 0 0 0 3.464 0"}},
      {"path",
       %{
         "d" =>
           "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
       }}
    ],
    "Search" => [
      {"path", %{"d" => "m21 21-4.34-4.34"}},
      {"circle", %{"cx" => "11", "cy" => "11", "r" => "8"}}
    ],
    "Heart" => [
      {"path",
       %{
         "d" =>
           "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
       }}
    ],
    "Star" => [
      {"path",
       %{
         "d" =>
           "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
       }}
    ],
    "Check" => [
      {"path", %{"d" => "M20 6 9 17l-5-5"}}
    ],
    "X" => [
      {"path", %{"d" => "M18 6 6 18"}},
      {"path", %{"d" => "m6 6 12 12"}}
    ],
    "AlertCircle" => [
      {"circle", %{"cx" => "12", "cy" => "12", "r" => "10"}},
      {"line", %{"x1" => "12", "y1" => "8", "x2" => "12", "y2" => "12"}},
      {"line", %{"x1" => "12", "y1" => "16", "x2" => "12.01", "y2" => "16"}}
    ],
    "Info" => [
      {"circle", %{"cx" => "12", "cy" => "12", "r" => "10"}},
      {"path", %{"d" => "M12 16v-4"}},
      {"path", %{"d" => "M12 8h.01"}}
    ]
  }

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def div(assigns) do
    ~H"""
    <div class={@class} {@rest}>
      <%= if @inner_block != [] do %>
        <%= render_slot(@inner_block) %>
      <% end %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def span(assigns) do
    ~H"""
    <span class={@class} {@rest}>
      <%= if @inner_block != [] do %>
        <%= render_slot(@inner_block) %>
      <% end %>
    </span>
    """
  end

  attr :variant, :string, default: "default"
  attr :as, :string, default: "p"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def text(assigns) do
    assigns = assign(assigns, :variant_class, variant_class(assigns.variant))

    ~H"""
    <%= case @as do %>
      <% "span" -> %>
        <span class={[@variant_class, @class]} {@rest}><%= render_slot(@inner_block) %></span>
      <% "h1" -> %>
        <h1 class={[@variant_class, @class]} {@rest}><%= render_slot(@inner_block) %></h1>
      <% "h2" -> %>
        <h2 class={[@variant_class, @class]} {@rest}><%= render_slot(@inner_block) %></h2>
      <% "h3" -> %>
        <h3 class={[@variant_class, @class]} {@rest}><%= render_slot(@inner_block) %></h3>
      <% "h4" -> %>
        <h4 class={[@variant_class, @class]} {@rest}><%= render_slot(@inner_block) %></h4>
      <% _ -> %>
        <p class={[@variant_class, @class]} {@rest}><%= render_slot(@inner_block) %></p>
    <% end %>
    """
  end

  attr :href, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def link(assigns) do
    ~H"""
    <a href={@href} class={@class} {@rest}>
      <%= render_slot(@inner_block) %>
    </a>
    """
  end

  attr :src, :string, required: true
  attr :alt, :string, default: nil
  attr :rounded, :boolean, default: false
  attr :aspect_ratio, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global

  def image(assigns) do
    aspect_class =
      case assigns.aspect_ratio do
        "1:1" -> "aspect-square"
        "16:9" -> "aspect-video"
        "4:3" -> "aspect-[4/3]"
        _ -> nil
      end

    assigns = assign(assigns, :aspect_class, aspect_class)

    ~H"""
    <img
      src={@src}
      alt={@alt}
      class={[@rounded && "rounded-lg", @aspect_class, "object-cover", @class]}
      {@rest}
    />
    """
  end

  attr :name, :string, required: true
  attr :size, :string, default: "md"
  attr :class, :string, default: nil
  attr :rest, :global

  def icon(assigns) do
    nodes = Map.get(@icon_nodes, assigns.name)
    assigns =
      assigns
      |> assign(:nodes, nodes)
      |> assign(:size_class, icon_size_class(assigns.size))

    ~H"""
    <%= if @nodes do %>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={[@size_class, @class]}
        {@rest}
      >
        <%= for {tag, attrs} <- @nodes do %>
          <%= icon_node(tag, attrs) %>
        <% end %>
      </svg>
    <% else %>
      <span class={[@size_class, @class]} {@rest}><%= @name %></span>
    <% end %>
    """
  end

  defp icon_node("path", attrs) do
    assigns = %{attrs: attrs}

    ~H"""
    <path d={@attrs["d"]} />
    """
  end

  defp icon_node("circle", attrs) do
    assigns = %{attrs: attrs}

    ~H"""
    <circle cx={@attrs["cx"]} cy={@attrs["cy"]} r={@attrs["r"]} />
    """
  end

  defp icon_node("rect", attrs) do
    assigns = %{attrs: attrs}

    ~H"""
    <rect x={@attrs["x"]} y={@attrs["y"]} width={@attrs["width"]} height={@attrs["height"]} rx={@attrs["rx"]} />
    """
  end

  defp icon_node("line", attrs) do
    assigns = %{attrs: attrs}

    ~H"""
    <line x1={@attrs["x1"]} y1={@attrs["y1"]} x2={@attrs["x2"]} y2={@attrs["y2"]} />
    """
  end

  defp icon_node(_tag, _attrs), do: nil

  defp variant_class(nil), do: nil
  defp variant_class(value), do: Map.get(@variant_styles, value)

  defp icon_size_class(nil), do: nil
  defp icon_size_class(value), do: Map.get(@size_map, value)
end
