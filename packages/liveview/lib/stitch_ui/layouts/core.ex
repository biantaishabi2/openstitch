defmodule StitchUI.Layouts.Core do
  use Phoenix.Component

  @gap_map %{
    0 => "gap-0",
    1 => "gap-1",
    2 => "gap-2",
    3 => "gap-3",
    4 => "gap-4",
    5 => "gap-5",
    6 => "gap-6",
    8 => "gap-8",
    10 => "gap-10",
    12 => "gap-12"
  }

  @grid_cols_map %{
    1 => "grid-cols-1",
    2 => "grid-cols-2",
    3 => "grid-cols-3",
    4 => "grid-cols-4",
    5 => "grid-cols-5",
    6 => "grid-cols-6",
    12 => "grid-cols-12"
  }

  @justify_map %{
    "start" => "justify-start",
    "end" => "justify-end",
    "center" => "justify-center",
    "between" => "justify-between",
    "around" => "justify-around",
    "evenly" => "justify-evenly"
  }

  @align_map %{
    "start" => "items-start",
    "end" => "items-end",
    "center" => "items-center",
    "stretch" => "items-stretch",
    "baseline" => "items-baseline"
  }

  @direction_map %{
    "row" => "flex-row",
    "column" => "flex-col",
    "col" => "flex-col",
    "row-reverse" => "flex-row-reverse",
    "col-reverse" => "flex-col-reverse"
  }

  @padding_map %{
    0 => "p-0",
    4 => "p-4",
    6 => "p-6",
    8 => "p-8",
    12 => "p-12"
  }

  @max_width_map %{
    "sm" => "max-w-sm",
    "md" => "max-w-md",
    "lg" => "max-w-lg",
    "xl" => "max-w-xl",
    "2xl" => "max-w-2xl",
    "full" => "max-w-full"
  }

  @spacer_size_map %{
    1 => "h-1",
    2 => "h-2",
    3 => "h-3",
    4 => "h-4",
    5 => "h-5",
    6 => "h-6",
    8 => "h-8",
    10 => "h-10",
    12 => "h-12",
    16 => "h-16",
    20 => "h-20"
  }

  attr :direction, :string, default: "row"
  attr :gap, :integer, default: 0
  attr :justify, :string, default: nil
  attr :align, :string, default: nil
  attr :wrap, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def layout(assigns) do
    assigns =
      assigns
      |> assign(:direction_class, direction_class(assigns.direction))
      |> assign(:gap_class, gap_class(assigns.gap))
      |> assign(:justify_class, justify_class(assigns.justify))
      |> assign(:align_class, align_class(assigns.align))

    ~H"""
    <div
      class={[
        "flex",
        @direction_class,
        @gap_class,
        @justify_class,
        @align_class,
        @wrap && "flex-wrap",
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :columns, :integer, default: 3
  attr :gap, :integer, default: 4
  attr :slots, :map, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def grid(assigns) do
    assigns =
      assigns
      |> assign(:grid_cols_class, grid_cols_class(assigns.columns))
      |> assign(:gap_class, gap_class(assigns.gap))

    ~H"""
    <div class={["grid", @grid_cols_class, @gap_class, @class]} {@rest}>
      <%= if @slots do %>
        <%= for {key, content} <- sorted_slots(@slots) do %>
          <div data-slot={key}><%= content %></div>
        <% end %>
      <% else %>
        <%= render_slot(@inner_block) %>
      <% end %>
    </div>
    """
  end

  attr :layout, :string, default: "1:1"
  attr :gap, :integer, default: 4
  attr :slots, :map, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def columns(assigns) do
    ratios =
      case assigns.layout do
        "equal" -> []
        layout -> String.split(layout, ":") |> Enum.map(&String.to_integer/1)
      end

    assigns =
      assigns
      |> assign(:ratios, ratios)
      |> assign(:gap_class, gap_class(assigns.gap))

    ~H"""
    <div class={["flex", @gap_class, @class]} {@rest}>
      <%= if @slots do %>
        <%= for {{key, content}, index} <- Enum.with_index(sorted_slots(@slots)) do %>
          <div data-slot={key} style={column_style(@ratios, index)}><%= content %></div>
        <% end %>
      <% else %>
        <%= render_slot(@inner_block) %>
      <% end %>
    </div>
    """
  end

  attr :ratio, :string, default: "1:1"
  attr :gap, :integer, default: 4
  attr :vertical, :boolean, default: false
  attr :slots, :map, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def split(assigns) do
    [first, second] =
      assigns.ratio
      |> String.split(":")
      |> Enum.map(&String.to_integer/1)

    assigns =
      assigns
      |> assign(:first, first)
      |> assign(:second, second)
      |> assign(:gap_class, gap_class(assigns.gap))

    ~H"""
    <div class={["flex", @vertical && "flex-col" || "flex-row", @gap_class, @class]} {@rest}>
      <%= if @slots do %>
        <div data-slot={@vertical && "top" || "left"} style={"flex: #{@first}"}>
          <%= slot_value(@slots, @vertical && "top" || "left") %>
        </div>
        <div data-slot={@vertical && "bottom" || "right"} style={"flex: #{@second}"}>
          <%= slot_value(@slots, @vertical && "bottom" || "right") %>
        </div>
      <% else %>
        <%= render_slot(@inner_block) %>
      <% end %>
    </div>
    """
  end

  attr :gap, :integer, default: 4
  attr :align, :string, default: "stretch"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def stack(assigns) do
    assigns =
      assigns
      |> assign(:gap_class, gap_class(assigns.gap))
      |> assign(:align_class, align_class(assigns.align))

    ~H"""
    <div class={["flex flex-col", @gap_class, @align_class, @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :direction, :string, default: "row"
  attr :justify, :string, default: "start"
  attr :align, :string, default: "stretch"
  attr :wrap, :boolean, default: false
  attr :gap, :integer, default: 0
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def flex(assigns) do
    assigns =
      assigns
      |> assign(:direction_class, direction_class(assigns.direction))
      |> assign(:justify_class, justify_class(assigns.justify))
      |> assign(:align_class, align_class(assigns.align))
      |> assign(:gap_class, gap_class(assigns.gap))

    ~H"""
    <div
      class={[
        "flex",
        @direction_class,
        @justify_class,
        @align_class,
        @wrap && "flex-wrap",
        @gap_class,
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :gap, :integer, default: 4
  attr :slots, :map, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def rows(assigns) do
    assigns = assign(assigns, :gap_class, gap_class(assigns.gap))

    ~H"""
    <div class={["flex flex-col", @gap_class, @class]} {@rest}>
      <%= if @slots do %>
        <%= for {key, content} <- sorted_slots(@slots) do %>
          <div data-slot={key}><%= content %></div>
        <% end %>
      <% else %>
        <%= render_slot(@inner_block) %>
      <% end %>
    </div>
    """
  end

  attr :full_height, :boolean, default: true
  attr :centered, :boolean, default: false
  attr :padding, :integer, default: 0
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def page(assigns) do
    assigns = assign(assigns, :padding_class, padding_class(assigns.padding))

    ~H"""
    <div
      class={[
        "w-full bg-background",
        @full_height && "min-h-screen",
        @centered && "flex flex-col items-center justify-center",
        @padding_class,
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :max_width, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def center(assigns) do
    assigns = assign(assigns, :max_width_class, max_width_class(assigns.max_width))

    ~H"""
    <div class={["flex items-center justify-center", @max_width_class, @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :size, :integer, default: 4
  attr :class, :string, default: nil
  attr :rest, :global

  def spacer(assigns) do
    assigns = assign(assigns, :size_class, spacer_size_class(assigns.size))

    ~H"""
    <div class={["w-full", @size_class, @class]} {@rest}></div>
    """
  end

  attr :orientation, :string, default: "horizontal"
  attr :label, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global

  def layout_divider(assigns) do
    ~H"""
    <%= if @label do %>
      <div class={["flex items-center gap-4", @class]} {@rest}>
        <div class="flex-1 h-px bg-border"></div>
        <span class="text-sm text-muted-foreground"><%= @label %></span>
        <div class="flex-1 h-px bg-border"></div>
      </div>
    <% else %>
      <div
        class={[
          @orientation == "horizontal" && "h-px w-full" || "w-px h-full",
          "bg-border",
          @class
        ]}
        {@rest}
      ></div>
    <% end %>
    """
  end

  defp sorted_slots(slots) do
    slots
    |> Enum.sort_by(fn {key, _value} ->
      case Integer.parse(to_string(key)) do
        {value, _} -> value
        :error -> to_string(key)
      end
    end)
  end

  defp gap_class(nil), do: nil
  defp gap_class(value), do: Map.get(@gap_map, value)

  defp grid_cols_class(nil), do: nil
  defp grid_cols_class(value), do: Map.get(@grid_cols_map, value)

  defp justify_class(nil), do: nil
  defp justify_class(value), do: Map.get(@justify_map, value)

  defp align_class(nil), do: nil
  defp align_class(value), do: Map.get(@align_map, value)

  defp direction_class(nil), do: nil
  defp direction_class(value), do: Map.get(@direction_map, value)

  defp padding_class(nil), do: nil
  defp padding_class(value), do: Map.get(@padding_map, value)

  defp max_width_class(nil), do: nil
  defp max_width_class(value), do: Map.get(@max_width_map, value)

  defp spacer_size_class(nil), do: nil
  defp spacer_size_class(value), do: Map.get(@spacer_size_map, value)

  defp column_style([], _index), do: "flex: 1"

  defp column_style(ratios, index) do
    ratio = Enum.at(ratios, index, 1)
    "flex: #{ratio}"
  end

  defp slot_value(nil, _key), do: nil
  defp slot_value(slots, key), do: Map.get(slots, key)
end
