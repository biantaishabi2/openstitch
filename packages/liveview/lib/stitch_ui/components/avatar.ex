defmodule StitchUI.Components.Avatar do
  use Phoenix.Component

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def avatar(assigns) do
    ~H"""
    <div data-slot="avatar" class={["relative flex size-8 shrink-0 overflow-hidden rounded-full", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :src, :string, default: nil
  attr :alt, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global

  def avatar_image(assigns) do
    ~H"""
    <img data-slot="avatar-image" src={@src} alt={@alt} class={["aspect-square size-full", @class]} {@rest} />
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def avatar_fallback(assigns) do
    ~H"""
    <div data-slot="avatar-fallback" class={["bg-muted flex size-full items-center justify-center rounded-full", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end
end
