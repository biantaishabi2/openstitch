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

  @icon_nodes StitchUI.Components.LucideIcons.icon_nodes()

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
