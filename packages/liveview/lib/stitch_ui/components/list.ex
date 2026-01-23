defmodule StitchUI.Components.List do
  use Phoenix.Component

  attr :divided, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def list(assigns) do
    ~H"""
    <ul class={["w-full", @divided && "divide-y divide-border", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </ul>
    """
  end

  attr :title, :string, default: nil
  attr :description, :string, default: nil
  attr :clickable, :boolean, default: false
  attr :selected, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global
  slot :icon
  slot :avatar
  slot :extra
  slot :action
  slot :inner_block

  def list_item(assigns) do
    ~H"""
    <li
      class={[
        "flex items-center gap-4 py-3 px-4",
        @clickable && "cursor-pointer hover:bg-muted/50 transition-colors",
        @selected && "bg-muted",
        @class
      ]}
      {@rest}
    >
      <%= if @icon != [] || @avatar != [] do %>
        <div class="flex-shrink-0">
          <%= if @avatar != [] do %>
            <%= render_slot(@avatar) %>
          <% else %>
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <%= render_slot(@icon) %>
            </div>
          <% end %>
        </div>
      <% end %>
      <div class="flex-1 min-w-0">
        <%= if @title do %>
          <p class="text-sm font-medium text-foreground truncate"><%= @title %></p>
        <% end %>
        <%= if @description do %>
          <p class="text-sm text-muted-foreground truncate"><%= @description %></p>
        <% end %>
        <%= if @inner_block != [] do %>
          <%= render_slot(@inner_block) %>
        <% end %>
      </div>
      <%= if @extra != [] do %>
        <div class="flex-shrink-0 text-sm text-muted-foreground">
          <%= render_slot(@extra) %>
        </div>
      <% end %>
      <%= if @action != [] do %>
        <div class="flex-shrink-0">
          <%= render_slot(@action) %>
        </div>
      <% end %>
      <%= if @clickable && @action == [] do %>
        <svg
          class="h-4 w-4 text-muted-foreground"
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
