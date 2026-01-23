defmodule StitchUI.Components.Statistic do
  use Phoenix.Component

  @trend_colors %{
    "up" => "text-green-500",
    "down" => "text-red-500",
    "neutral" => "text-muted-foreground"
  }

  attr :title, :string, default: nil
  attr :value, :any, required: true
  attr :value_prefix, :string, default: nil
  attr :value_suffix, :string, default: nil
  attr :trend, :string, default: nil
  attr :trend_value, :string, default: nil
  attr :description, :string, default: nil
  attr :loading, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global

  def statistic(assigns) do
    trend_class = Map.get(@trend_colors, assigns.trend || "neutral", "text-muted-foreground")
    assigns = assign(assigns, :trend_class, trend_class)

    ~H"""
    <%= if @loading do %>
      <div class={["space-y-2", @class]} {@rest}>
        <div class="h-4 w-20 animate-pulse rounded bg-muted"></div>
        <div class="h-8 w-32 animate-pulse rounded bg-muted"></div>
        <%= if @description do %>
          <div class="h-3 w-24 animate-pulse rounded bg-muted"></div>
        <% end %>
      </div>
    <% else %>
      <div class={["space-y-1", @class]} {@rest}>
        <%= if @title do %>
          <p class="text-sm font-medium text-muted-foreground"><%= @title %></p>
        <% end %>
        <div class="flex items-baseline gap-2">
          <div class="flex items-baseline gap-1">
            <%= if @value_prefix do %>
              <span class="text-2xl text-muted-foreground"><%= @value_prefix %></span>
            <% end %>
            <span class="text-3xl font-bold tracking-tight"><%= @value %></span>
            <%= if @value_suffix do %>
              <span class="text-lg text-muted-foreground"><%= @value_suffix %></span>
            <% end %>
          </div>
          <%= if @trend && @trend_value do %>
            <div class={["flex items-center gap-0.5 text-sm", @trend_class]}>
              <%= trend_icon(%{trend: @trend}) %>
              <span><%= @trend_value %></span>
            </div>
          <% end %>
        </div>
        <%= if @description do %>
          <p class="text-xs text-muted-foreground"><%= @description %></p>
        <% end %>
      </div>
    <% end %>
    """
  end

  attr :title, :string, default: nil
  attr :value, :any, default: nil
  attr :value_prefix, :string, default: nil
  attr :value_suffix, :string, default: nil
  attr :trend, :string, default: nil
  attr :trend_value, :string, default: nil
  attr :description, :string, default: nil
  attr :loading, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block
  slot :icon

  def statistic_card(assigns) do
    assigns =
      assigns
      |> assign(:has_inner, assigns.inner_block != [])
      |> assign(:stat_value, if(is_nil(assigns.value), do: "-", else: assigns.value))

    ~H"""
    <div class={["rounded-lg border bg-card p-6 shadow-sm", @class]} {@rest}>
      <div class="flex items-start justify-between">
        <%= if @has_inner do %>
          <%= render_slot(@inner_block) %>
        <% else %>
          <.statistic
            title={@title}
            value={@stat_value}
            value_prefix={@value_prefix}
            value_suffix={@value_suffix}
            trend={@trend}
            trend_value={@trend_value}
            description={@description}
            loading={@loading}
          />
        <% end %>
        <%= if @icon != [] do %>
          <div class="rounded-full bg-muted p-2.5">
            <%= render_slot(@icon) %>
          </div>
        <% end %>
      </div>
    </div>
    """
  end

  defp trend_icon(assigns) do
    assigns = Map.put_new(assigns, :trend, "neutral")

    ~H"""
    <%= case @trend do %>
      <% "up" -> %>
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 17 6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      <% "down" -> %>
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 7 6 6 4-4 8 8" />
          <path d="M14 17h7v-7" />
        </svg>
      <% _ -> %>
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14" />
        </svg>
    <% end %>
    """
  end
end
