defmodule StitchUI.DemoLive do
  use Phoenix.LiveView
  import StitchUI.DemoComponents

  def mount(_params, _session, socket) do
    {:ok, assign(socket, tabs_value: "overview")}
  end

  def render(assigns) do
    components_showcase(assigns)
  end

  def handle_event("tabs-change", %{"tab" => value}, socket) do
    {:noreply, assign(socket, tabs_value: value)}
  end
end
