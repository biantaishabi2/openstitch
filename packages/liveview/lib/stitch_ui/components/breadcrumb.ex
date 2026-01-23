defmodule StitchUI.Components.Breadcrumb do
  use Phoenix.Component

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb(assigns) do
    ~H"""
    <nav aria-label="breadcrumb" data-slot="breadcrumb" class={@class} {@rest}>
      <%= render_slot(@inner_block) %>
    </nav>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb_list(assigns) do
    ~H"""
    <ol
      data-slot="breadcrumb-list"
      class={["text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5", @class]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </ol>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb_item(assigns) do
    ~H"""
    <li data-slot="breadcrumb-item" class={["inline-flex items-center gap-1.5", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </li>
    """
  end

  attr :href, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb_link(assigns) do
    ~H"""
    <a
      data-slot="breadcrumb-link"
      href={@href}
      class={["hover:text-foreground transition-colors", @class]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </a>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def breadcrumb_page(assigns) do
    ~H"""
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      class={["text-foreground font-normal", @class]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </span>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def breadcrumb_separator(assigns) do
    ~H"""
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      class={[@class, "[&>svg]:size-3.5"]}
      {@rest}
    >
      <%= if @inner_block != [] do %>
        <%= render_slot(@inner_block) %>
      <% else %>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      <% end %>
    </li>
    """
  end
end
