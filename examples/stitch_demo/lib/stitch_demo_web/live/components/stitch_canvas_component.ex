defmodule StitchDemoWeb.StitchCanvasComponent do
  @moduledoc """
  Stitch Canvas LiveComponent - 可复用的无限画布组件

  使用 CSS Transform 实现缩放/平移，用 iframe 加载每个 Screen。

  ## 使用方式

      <.live_component
        module={StitchDemoWeb.StitchCanvasComponent}
        id="my-canvas"
        screens={@screens}
      />

  ## 参数

  - `id` (必需) - 组件唯一标识
  - `screens` (必需) - Screen 列表，每项包含 `file` 和 `title`
  - `scale` (可选) - 初始缩放比例，默认 1.0
  - `translate_x` (可选) - 初始 X 偏移，默认 50
  - `translate_y` (可选) - 初始 Y 偏移，默认 80
  - `show_hint` (可选) - 是否显示操作提示，默认 true
  - `screen_base_url` (可选) - Screen 文件的基础 URL，默认 "/screens"
  """
  use StitchDemoWeb, :live_component

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       scale: 1.0,
       translate_x: 50,
       translate_y: 80,
       show_hint: true,
       screen_base_url: "/screens",
       inspector_mode: false
     )}
  end

  @impl true
  def update(assigns, socket) do
    # 合并传入的参数，保留默认值
    socket =
      socket
      |> assign(:id, assigns.id)
      |> assign(:screens, assigns[:screens] || [])
      |> maybe_assign(:scale, assigns)
      |> maybe_assign(:translate_x, assigns)
      |> maybe_assign(:translate_y, assigns)
      |> maybe_assign(:show_hint, assigns)
      |> maybe_assign(:screen_base_url, assigns)

    {:ok, socket}
  end

  defp maybe_assign(socket, key, assigns) do
    if Map.has_key?(assigns, key) do
      assign(socket, key, assigns[key])
    else
      socket
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div id={"stitch-canvas-wrapper-#{@id}"} class={"w-full h-full " <> if @inspector_mode, do: "inspector-mode", else: ""}>
      <style>
        .screen-iframe { pointer-events: none; }
        .inspector-mode .screen-iframe { pointer-events: auto !important; }
      </style>
      <div
        id={"stitch-canvas-#{@id}"}
        phx-hook="StitchCanvas"
        phx-target={@myself}
        class="w-full h-full overflow-hidden relative"
        style="background-color: #f5f5f5; background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px); background-size: 20px 20px; touch-action: none;"
        data-canvas-id={@id}
      >
      <%!-- 画布层 --%>
      <div
        id={"canvas-layer-#{@id}"}
        class="canvas-layer"
        style={"transform-origin: 0 0; transform: translate(#{@translate_x}px, #{@translate_y}px) scale(#{@scale});"}
      >
        <%= for {screen, index} <- Enum.with_index(@screens) do %>
          <div
            class="screen-wrapper absolute"
            style={"left: #{index * 455}px; top: 0; width: 375px;"}
          >
            <%!-- Screen 标题 --%>
            <div class="text-sm font-semibold text-gray-700 mb-2 px-1 flex justify-between items-center">
              <span><%= screen.title %></span>
              <a
                href={"#{@screen_base_url}/#{screen.file}"}
                target="_blank"
                class="text-xs text-blue-500 hover:text-blue-700"
              >
                打开 ↗
              </a>
            </div>
            <%!-- Screen 容器 --%>
            <div
              class="bg-white rounded-xl border border-gray-200 overflow-hidden"
              style="width: 375px; height: 667px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); touch-action: none;"
            >
              <div style="width: 375px; height: 667px; overflow: hidden;">
                <iframe
                  src={"#{@screen_base_url}/#{screen.file}"}
                  class="screen-iframe"
                  style="width: 1024px; height: 1820px; border: 0; transform: scale(0.366); transform-origin: 0 0; touch-action: none;"
                  id={"screen-#{@id}-#{index}"}
                />
              </div>
            </div>
          </div>
        <% end %>
      </div>

      <%!-- 操作提示 --%>
      <%= if @show_hint do %>
        <div class="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded-lg text-sm text-gray-600 shadow-sm pointer-events-none">
          滚轮缩放 · 拖拽画布平移
        </div>
      <% end %>

      <%!-- 缩放比例显示 --%>
      <div class="absolute bottom-4 right-24 bg-white/90 px-3 py-1.5 rounded-lg text-sm text-gray-600 shadow-sm pointer-events-none">
        <%= round(@scale * 100) %>%
      </div>

      <%!-- 提示：点击标题旁的"打开"链接可在新标签页中使用 Inspector --%>
    </div>

    <%!-- 内联触摸支持脚本 --%>
    <script>
    (function() {
      const canvasId = '<%= @id %>';
      const canvasEl = document.getElementById('stitch-canvas-' + canvasId);
      const layerEl = document.getElementById('canvas-layer-' + canvasId);

      if (!canvasEl || !layerEl) return;
      if (canvasEl._touchInitialized) return;
      canvasEl._touchInitialized = true;

      let scale = <%= @scale %>;
      let translateX = <%= @translate_x %>;
      let translateY = <%= @translate_y %>;
      let isDragging = false;
      let isPinching = false;
      let lastTouchX = 0;
      let lastTouchY = 0;
      let lastPinchDist = 0;

      function updateTransform() {
        layerEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      }

      function getPinchDist(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }

      canvasEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length === 1) {
          isDragging = true;
          isPinching = false;
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          isDragging = false;
          isPinching = true;
          lastPinchDist = getPinchDist(e.touches);
          lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        }
      }, { passive: false });

      canvasEl.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging && !isPinching) {
          const dx = e.touches[0].clientX - lastTouchX;
          const dy = e.touches[0].clientY - lastTouchY;
          translateX += dx;
          translateY += dy;
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
          updateTransform();
        } else if (e.touches.length === 2 && isPinching) {
          const newDist = getPinchDist(e.touches);
          const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          const scaleRatio = newDist / lastPinchDist;
          const newScale = Math.max(0.1, Math.min(3, scale * scaleRatio));
          const rect = canvasEl.getBoundingClientRect();
          const pinchX = centerX - rect.left;
          const pinchY = centerY - rect.top;
          const canvasX = (pinchX - translateX) / scale;
          const canvasY = (pinchY - translateY) / scale;
          translateX = pinchX - canvasX * newScale;
          translateY = pinchY - canvasY * newScale;
          scale = newScale;
          const dx = centerX - lastTouchX;
          const dy = centerY - lastTouchY;
          translateX += dx;
          translateY += dy;
          lastPinchDist = newDist;
          lastTouchX = centerX;
          lastTouchY = centerY;
          updateTransform();
        }
      }, { passive: false });

      canvasEl.addEventListener('touchend', () => {
        isDragging = false;
        isPinching = false;
      });

      console.log('[StitchCanvas] Component ' + canvasId + ' touch initialized');
    })();
    </script>
    </div>
    """
  end

  @impl true
  def handle_event("zoom", %{"scale" => scale, "x" => x, "y" => y}, socket) do
    {:noreply, assign(socket, scale: scale, translate_x: x, translate_y: y)}
  end

  @impl true
  def handle_event("pan", %{"x" => x, "y" => y}, socket) do
    {:noreply, assign(socket, translate_x: x, translate_y: y)}
  end

  @impl true
  def handle_event("toggle_inspector", _params, socket) do
    {:noreply, assign(socket, inspector_mode: !socket.assigns.inspector_mode)}
  end
end
