defmodule StitchUI.Components.Stepper do
  use Phoenix.Component

  attr :current_step, :integer, default: 0
  attr :orientation, :string, default: "horizontal"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def stepper(assigns) do
    ~H"""
    <div
      data-current-step={@current_step}
      class={[
        "flex",
        @orientation == "horizontal" && "flex-row items-center" || "flex-col",
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @status_classes %{
    "completed" => "border-primary bg-primary text-primary-foreground",
    "current" => "border-primary bg-background text-primary",
    "pending" => "border-muted bg-background text-muted-foreground"
  }

  attr :title, :string, default: nil
  attr :description, :string, default: nil
  attr :status, :string, default: nil
  attr :step_number, :integer, default: nil
  attr :index, :integer, default: nil
  attr :current_step, :integer, default: nil
  attr :is_last, :boolean, default: false
  attr :orientation, :string, default: "horizontal"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :icon

  def step(assigns) do
    step_number = assigns.step_number || (assigns.index && assigns.index + 1)

    status =
      cond do
        assigns.status -> assigns.status
        is_integer(assigns.current_step) and is_integer(assigns.index) ->
          cond do
            assigns.index < assigns.current_step -> "completed"
            assigns.index == assigns.current_step -> "current"
            true -> "pending"
          end
        true -> "pending"
      end

    status_class = Map.get(@status_classes, status, "border-muted bg-background text-muted-foreground")

    assigns =
      assigns
      |> assign(:status_class, status_class)
      |> assign(:status, status)
      |> assign(:step_number, step_number)

    ~H"""
    <div
      class={[
        "flex",
        @orientation == "horizontal" && "flex-1 items-center" || "flex-row items-start",
        @class
      ]}
      {@rest}
    >
      <div class={["flex", @orientation == "horizontal" && "flex-col items-center" || "flex-row items-start"]}>
        <div class={["flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors", @status_class]}>
          <%= if @status == "completed" do %>
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          <% else %>
            <%= if @icon != [] do %>
              <%= render_slot(@icon) %>
            <% else %>
              <%= @step_number %>
            <% end %>
          <% end %>
        </div>
        <div class={["flex flex-col", @orientation == "horizontal" && "mt-2 items-center text-center" || "ml-4"]}>
          <%= if @title do %>
            <span class={["text-sm font-medium", @status == "pending" && "text-muted-foreground" || "text-foreground"]}><%= @title %></span>
          <% end %>
          <%= if @description do %>
            <span class="text-xs text-muted-foreground"><%= @description %></span>
          <% end %>
        </div>
      </div>
      <%= if !@is_last do %>
        <div
          class={[
            "transition-colors",
            @orientation == "horizontal" && "mx-4 h-0.5 flex-1 self-start mt-5" || "ml-5 mt-2 w-0.5 min-h-[2rem]",
            @status == "completed" && "bg-primary" || "bg-muted"
          ]}
        ></div>
      <% end %>
    </div>
    """
  end
end
