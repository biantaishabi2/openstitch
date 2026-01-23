defmodule StitchUI.Components.Card do
  use Phoenix.Component

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def card(assigns) do
    ~H"""
    <div data-slot="card" class={["bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def card_header(assigns) do
    ~H"""
    <div data-slot="card-header" class={[@class, "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6"]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def card_title(assigns) do
    ~H"""
    <h3 data-slot="card-title" class={["leading-none font-semibold", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </h3>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def card_description(assigns) do
    ~H"""
    <p data-slot="card-description" class={["text-muted-foreground text-sm", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </p>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def card_content(assigns) do
    ~H"""
    <div data-slot="card-content" class={["px-6", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def card_footer(assigns) do
    ~H"""
    <div data-slot="card-footer" class={["flex items-center px-6 [.border-t]:pt-6", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end
end
