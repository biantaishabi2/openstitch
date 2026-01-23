defmodule StitchUI.Components.Forms do
  use Phoenix.Component

  @button_variants %{
    "default" => "bg-primary text-primary-foreground hover:bg-primary/90",
    "destructive" =>
      "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
    "outline" =>
      "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
    "secondary" => "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    "ghost" => "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
    "link" => "text-primary underline-offset-4 hover:underline"
  }

  @button_sizes %{
    "default" => "h-9 px-4 py-2 has-[>svg]:px-3",
    "sm" => "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
    "lg" => "h-10 rounded-md px-6 has-[>svg]:px-4",
    "icon" => "size-9",
    "icon-sm" => "size-8",
    "icon-lg" => "size-10"
  }

  attr :variant, :string, default: "default"
  attr :size, :string, default: "default"
  attr :type, :string, default: "button"
  attr :class, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :rest, :global
  slot :inner_block, required: true

  def button(assigns) do
    assigns =
      assigns
      |> assign(:variant_class, button_variant_class(assigns.variant))
      |> assign(:size_class, button_size_class(assigns.size))

    ~H"""
    <button
      type={@type}
      data-slot="button"
      data-variant={@variant}
      data-size={@size}
      class={[
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        @variant_class,
        @size_class,
        @class
      ]}
      disabled={@disabled}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  attr :type, :string, default: "text"
  attr :placeholder, :string, default: nil
  attr :value, :string, default: nil
  attr :default_value, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global

  def input(assigns) do
    ~H"""
    <input
      type={@type}
      placeholder={@placeholder}
      value={@value}
      data-slot="input"
      class={[
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        @class
      ]}
      {@rest}
    />
    """
  end

  attr :for, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def label(assigns) do
    ~H"""
    <label
      for={@for}
      data-slot="label"
      class={["flex items-center gap-2 text-sm leading-none font-medium select-none", @class]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </label>
    """
  end

  @doc """
  复选框组件

  ## 属性
  - `checked` - 是否选中（由父组件/LiveView管理）
  - `name` - 字段名称，用于事件中区分不同checkbox
  - `on_change` - phx-click事件名称，点击时发送 `%{"name" => name}`

  ## 示例

      <.checkbox name="agree" checked={@agree} on_change="toggle-checkbox" />

      # 在LiveView中处理:
      def handle_event("toggle-checkbox", %{"name" => name}, socket) do
        key = String.to_existing_atom(name)
        {:noreply, assign(socket, key, !socket.assigns[key])}
      end
  """
  attr :checked, :boolean, default: false
  attr :id, :string, default: nil
  attr :name, :string, default: nil
  attr :on_change, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global

  def checkbox(assigns) do
    state = if assigns.checked, do: "checked", else: "unchecked"
    assigns = assign(assigns, :state, state)

    ~H"""
    <button
      type="button"
      role="checkbox"
      aria-checked={@checked}
      id={@id}
      data-slot="checkbox"
      data-state={@state}
      disabled={@disabled}
      phx-click={@on_change}
      phx-value-name={@name}
      class={[
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        @class
      ]}
      {@rest}
    >
      <span data-slot="checkbox-indicator" class={["grid place-content-center text-current transition-none", @state != "checked" && "invisible"]}>
        <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    </button>
    """
  end

  attr :value, :string, default: nil
  attr :default_value, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def radio_group(assigns) do
    assigns = assign(assigns, :selected_value, assigns.value || assigns.default_value)

    ~H"""
    <div data-slot="radio-group" data-value={@selected_value} class={["grid gap-3", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  @doc """
  单选按钮项

  ## 属性
  - `value` - 选项值
  - `checked` - 是否选中（由父组件/LiveView管理）
  - `on_change` - phx-click事件名称，点击时发送 `%{"val" => value}`

  ## 示例

      <.radio_group_item value="option-1" checked={@radio_value == "option-1"} on_change="select-radio" />

      # 在LiveView中处理:
      def handle_event("select-radio", %{"val" => value}, socket) do
        {:noreply, assign(socket, radio_value: value)}
      end
  """
  attr :id, :string, default: nil
  attr :value, :string, required: true
  attr :checked, :boolean, default: false
  attr :on_change, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global

  def radio_group_item(assigns) do
    state = if assigns.checked, do: "checked", else: "unchecked"
    assigns = assign(assigns, :state, state)

    ~H"""
    <button
      type="button"
      role="radio"
      aria-checked={@checked}
      id={@id}
      data-slot="radio-group-item"
      data-state={@state}
      data-value={@value}
      disabled={@disabled}
      phx-click={@on_change}
      phx-value-val={@value}
      class={[
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        @class
      ]}
      {@rest}
    >
      <span data-slot="radio-group-indicator" class={["relative flex items-center justify-center text-primary", @state != "checked" && "invisible"]}>
        <svg class="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      </span>
    </button>
    """
  end

  @doc """
  开关组件

  ## 属性
  - `checked` - 是否开启（由父组件/LiveView管理）
  - `name` - 字段名称，用于事件中区分不同switch
  - `on_change` - phx-click事件名称，点击时发送 `%{"name" => name}`

  ## 示例

      <.switch name="notifications" checked={@notifications} on_change="toggle-switch" />

      # 在LiveView中处理:
      def handle_event("toggle-switch", %{"name" => name}, socket) do
        key = String.to_existing_atom(name)
        {:noreply, assign(socket, key, !socket.assigns[key])}
      end
  """
  attr :checked, :boolean, default: false
  attr :id, :string, default: nil
  attr :name, :string, default: nil
  attr :on_change, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global

  def switch(assigns) do
    state = if assigns.checked, do: "checked", else: "unchecked"
    assigns = assign(assigns, :state, state)

    ~H"""
    <button
      type="button"
      role="switch"
      aria-checked={@checked}
      id={@id}
      data-slot="switch"
      data-state={@state}
      disabled={@disabled}
      phx-click={@on_change}
      phx-value-name={@name}
      class={[
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        @class
      ]}
      {@rest}
    >
      <span
        data-slot="switch-thumb"
        data-state={@state}
        class="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      ></span>
    </button>
    """
  end

  attr :default_value, :any, default: nil
  attr :min, :integer, default: 0
  attr :max, :integer, default: 100
  attr :step, :integer, default: 1
  attr :orientation, :string, default: "horizontal"
  attr :class, :string, default: nil
  attr :rest, :global

  def slider(assigns) do
    min = assigns.min || 0
    max = assigns.max || 100

    value =
      case assigns.default_value do
        [first | _] -> first
        nil -> min
        other -> other
      end

    value =
      cond do
        value < min -> min
        value > max -> max
        true -> value
      end

    range = max - min
    percent = if range == 0, do: 0, else: round((value - min) / range * 100)

    assigns =
      assigns
      |> assign(:min, min)
      |> assign(:max, max)
      |> assign(:value, value)
      |> assign(:percent, percent)

    ~H"""
    <div
      data-slot="slider"
      data-value={@value}
      data-min={@min}
      data-max={@max}
      data-step={@step}
      data-orientation={@orientation}
      class={[
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        @class
      ]}
      {@rest}
    >
      <div
        data-slot="slider-track"
        data-orientation={@orientation}
        class="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <div
          data-slot="slider-range"
          data-orientation={@orientation}
          class="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          style={"width: #{@percent}%"}
        ></div>
      </div>
      <div
        data-slot="slider-thumb"
        class="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        style={"left: #{@percent}%; transform: translateX(-50%); position: absolute;"}
      ></div>
    </div>
    """
  end

  defp button_variant_class(nil), do: nil
  defp button_variant_class(value), do: Map.get(@button_variants, value)

  defp button_size_class(nil), do: nil
  defp button_size_class(value), do: Map.get(@button_sizes, value)
end
