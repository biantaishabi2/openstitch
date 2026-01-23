defmodule StitchUI.DemoLive do
  use Phoenix.LiveView
  import StitchUI.DemoComponents

  def mount(_params, _session, socket) do
    {:ok,
     assign(socket,
       tabs_value: "overview",
       # Checkbox 状态
       checkbox_1: false,
       checkbox_2: true,
       checkbox_disabled: false,
       # Switch 状态
       switch_1: false,
       switch_2: true,
       switch_disabled: false,
       # Radio 状态
       radio_value: "option-one"
     )}
  end

  def render(assigns) do
    components_showcase(assigns)
  end

  def handle_event("tabs-change", %{"tab" => value}, socket) do
    {:noreply, assign(socket, tabs_value: value)}
  end

  # 处理 checkbox 切换
  def handle_event("toggle-checkbox", %{"name" => name}, socket) do
    key = String.to_existing_atom(name)
    current = Map.get(socket.assigns, key, false)
    {:noreply, assign(socket, key, !current)}
  end

  # 处理 switch 切换
  def handle_event("toggle-switch", %{"name" => name}, socket) do
    key = String.to_existing_atom(name)
    current = Map.get(socket.assigns, key, false)
    {:noreply, assign(socket, key, !current)}
  end

  # 处理 radio 选择
  def handle_event("select-radio", %{"val" => value}, socket) do
    {:noreply, assign(socket, radio_value: value)}
  end
end
