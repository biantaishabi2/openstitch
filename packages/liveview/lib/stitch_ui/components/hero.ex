defmodule StitchUI.Components.Hero do
  use Phoenix.Component

  @size_classes %{
    "sm" => "min-h-[300px] py-12",
    "md" => "min-h-[400px] py-16",
    "lg" => "min-h-[500px] py-20",
    "full" => "min-h-screen py-24"
  }

  @align_classes %{
    "left" => "text-left items-start",
    "center" => "text-center items-center",
    "right" => "text-right items-end"
  }

  attr :title, :string, required: true
  attr :subtitle, :string, default: nil
  attr :description, :string, default: nil
  attr :background_image, :string, default: nil
  attr :background_color, :string, default: "bg-gradient-to-br from-slate-900 to-slate-800"
  attr :align, :string, default: "center"
  attr :size, :string, default: "lg"
  attr :overlay, :boolean, default: true
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def hero(assigns) do
    style =
      if assigns.background_image do
        "background-image: url(#{assigns.background_image}); background-size: cover; background-position: center;"
      else
        nil
      end

    assigns =
      assigns
      |> assign(:style, style)
      |> assign(:size_class, size_class(assigns.size))
      |> assign(:align_class, align_class(assigns.align))

    ~H"""
    <div
      class={[
        "relative flex flex-col justify-center overflow-hidden",
        @size_class,
        !@background_image && @background_color,
        @class
      ]}
      style={@style}
      {@rest}
    >
      <%= if @overlay && @background_image do %>
        <div class="absolute inset-0 bg-black/50"></div>
      <% end %>
      <div class={["relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6", @align_class]}>
        <%= if @subtitle do %>
          <span class="text-sm font-medium uppercase tracking-widest text-primary"><%= @subtitle %></span>
        <% end %>
        <h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"><%= @title %></h1>
        <%= if @description do %>
          <p class="max-w-2xl text-lg text-slate-300 sm:text-xl"><%= @description %></p>
        <% end %>
        <%= if @inner_block != [] do %>
          <div class="flex gap-4 mt-4">
            <%= render_slot(@inner_block) %>
          </div>
        <% end %>
      </div>
    </div>
    """
  end

  attr :title, :string, default: nil
  attr :subtitle, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def section(assigns) do
    ~H"""
    <section class={["py-12 md:py-16 lg:py-20", @class]} {@rest}>
      <%= if @title || @subtitle || @description do %>
        <div class="mx-auto max-w-2xl text-center mb-12">
          <%= if @subtitle do %>
            <span class="text-sm font-medium uppercase tracking-widest text-primary"><%= @subtitle %></span>
          <% end %>
          <%= if @title do %>
            <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"><%= @title %></h2>
          <% end %>
          <%= if @description do %>
            <p class="mt-4 text-lg text-muted-foreground"><%= @description %></p>
          <% end %>
        </div>
      <% end %>
      <%= if @inner_block != [] do %>
        <%= render_slot(@inner_block) %>
      <% end %>
    </section>
    """
  end

  @container_sizes %{
    "sm" => "max-w-2xl",
    "md" => "max-w-4xl",
    "lg" => "max-w-6xl",
    "xl" => "max-w-7xl",
    "full" => "max-w-full"
  }

  attr :size, :string, default: "lg"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def container(assigns) do
    assigns = assign(assigns, :container_class, container_class(assigns.size))

    ~H"""
    <div class={["mx-auto w-full px-4 sm:px-6 lg:px-8", @container_class, @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  defp size_class(nil), do: nil
  defp size_class(value), do: Map.get(@size_classes, value)

  defp align_class(nil), do: nil
  defp align_class(value), do: Map.get(@align_classes, value)

  defp container_class(nil), do: nil
  defp container_class(value), do: Map.get(@container_sizes, value)
end
