defmodule StitchDemoWeb.CanvasEditorLive do
  use StitchDemoWeb, :live_view

  # 使用别名避免与 CoreComponents 冲突
  alias StitchUI.Components.Basic
  alias StitchUI.Components.Forms
  alias StitchUI.Components.Feedback
  alias StitchUI.Components.Card
  alias StitchUI.Components.Statistic

  @demo_pages [
    %{id: "blank", name: "空白页面", schema: %{"type" => "Page", "children" => []}},
    %{id: "simple", name: "简单测试", schema: %{
      "type" => "Page",
      "children" => [
        %{"type" => "Text", "children" => "Hello World!"}
      ]
    }},
    %{id: "card-demo", name: "卡片示例", schema: %{
      "type" => "Page",
      "children" => [
        %{"type" => "Card", "props" => %{"className" => "w-80"},
          "children" => [
            %{"type" => "CardHeader", "children" => [
              %{"type" => "CardTitle", "children" => "卡片标题"},
              %{"type" => "CardDescription", "children" => "这是一个示例卡片"}
            ]},
            %{"type" => "CardContent", "children" => [
              %{"type" => "Text", "children" => "卡片内容区域"}
            ]},
            %{"type" => "CardFooter", "children" => [
              %{"type" => "Button", "props" => %{"variant" => "outline"}, "children" => "取消"},
              %{"type" => "Button", "children" => "确定"}
            ]}
          ]}
      ]
    }},
    %{id: "form-demo", name: "表单示例", schema: %{
      "type" => "Page",
      "children" => [
        %{"type" => "Card", "props" => %{"className" => "w-96"},
          "children" => [
            %{"type" => "CardHeader", "children" => [
              %{"type" => "CardTitle", "children" => "登录表单"}
            ]},
            %{"type" => "CardContent", "children" => [
              %{"type" => "Stack", "props" => %{"gap" => "4"},
                "children" => [
                  %{"type" => "Label", "children" => "用户名"},
                  %{"type" => "Input", "props" => %{"placeholder" => "请输入用户名"}},
                  %{"type" => "Label", "children" => "密码"},
                  %{"type" => "Input", "props" => %{"type" => "password", "placeholder" => "请输入密码"}},
                  %{"type" => "Button", "props" => %{"className" => "w-full"}, "children" => "登录"}
                ]}
            ]}
          ]}
      ]
    }},
    %{id: "dashboard-demo", name: "仪表盘示例", schema: %{
      "type" => "Page",
      "children" => [
        %{"type" => "Stack", "props" => %{"gap" => "6"},
          "children" => [
            %{"type" => "Text", "props" => %{"variant" => "title"}, "children" => "数据概览"},
            %{"type" => "Grid", "props" => %{"columns" => "3", "gap" => "4"},
              "children" => [
                %{"type" => "StatisticCard", "props" => %{"title" => "总用户", "value" => "12,345", "trend" => "up", "change" => "+12%"}},
                %{"type" => "StatisticCard", "props" => %{"title" => "活跃用户", "value" => "8,901", "trend" => "up", "change" => "+5%"}},
                %{"type" => "StatisticCard", "props" => %{"title" => "收入", "value" => "¥98,765", "trend" => "down", "change" => "-3%"}}
              ]}
          ]}
      ]
    }}
  ]

  def mount(_params, _session, socket) do
    {:ok,
     assign(socket,
       zoom: 100,
       selected_component: nil,
       components: [],
       exported_schema: nil,
       view_mode: "canvas",
       selected_demo: "blank",
       current_schema: %{"type" => "Page", "children" => []},
       demo_pages: @demo_pages
     )}
  end

  def render(assigns) do
    ~H"""
    <div class="h-screen flex flex-col bg-slate-100">
      <!-- 顶部工具栏 -->
      <header class="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0">
        <div class="flex items-center gap-4">
          <h1 class="font-semibold text-lg">Stitch Canvas Editor</h1>
          <div class="h-6 w-px bg-slate-200"></div>

          <!-- 视图切换 -->
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button
              phx-click="set_view_mode"
              phx-value-mode="canvas"
              class={"px-3 py-1 text-sm rounded-md transition " <> if(@view_mode == "canvas", do: "bg-white shadow", else: "hover:bg-slate-200")}
            >
              画布
            </button>
            <button
              phx-click="set_view_mode"
              phx-value-mode="preview"
              class={"px-3 py-1 text-sm rounded-md transition " <> if(@view_mode == "preview", do: "bg-white shadow", else: "hover:bg-slate-200")}
            >
              预览
            </button>
          </div>

          <div class="h-6 w-px bg-slate-200"></div>

          <!-- Demo 选择器 -->
          <div class="flex gap-1 bg-slate-100 rounded-lg p-1">
            <%= for demo <- @demo_pages do %>
              <button
                type="button"
                phx-click="select_demo"
                phx-value-demo_id={demo.id}
                class={"px-3 py-1 text-sm rounded-md transition " <> if(demo.id == @selected_demo, do: "bg-white shadow", else: "hover:bg-slate-200")}
              >
                <%= demo.name %>
              </button>
            <% end %>
          </div>

          <%= if @view_mode == "canvas" do %>
            <div class="h-6 w-px bg-slate-200"></div>
            <div class="flex gap-2">
              <button
                phx-click="add_card"
                class="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                + Card
              </button>
              <button
                phx-click="add_button"
                class="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                + Button
              </button>
              <button
                phx-click="add_text"
                class="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                + Text
              </button>
            </div>
          <% end %>
        </div>

        <div class="flex items-center gap-4">
          <%= if @view_mode == "canvas" do %>
            <span class="text-sm text-slate-500">缩放: <%= @zoom %>%</span>
          <% end %>
          <button
            phx-click="export"
            class="px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          >
            导出 JSON
          </button>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden">
        <%= if @view_mode == "canvas" do %>
          <!-- 画布模式 -->
          <div class="flex-1 relative overflow-hidden">
            <div
              id="canvas-container"
              phx-hook="CanvasEditor"
              class="w-full h-full"
              phx-update="ignore"
            >
            </div>
            <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow text-sm text-slate-600">
              <p>滚轮缩放 · 拖拽画布平移 · 点击选中组件</p>
            </div>
          </div>
        <% else %>
          <!-- 预览模式 -->
          <div class="flex-1 overflow-auto bg-white" phx-hook="StitchUI" id="preview-container">
            <div class="p-8">
              <%= render_schema(@current_schema, assigns) %>
            </div>
          </div>
        <% end %>

        <!-- 右侧面板 -->
        <aside class="w-80 bg-white border-l shrink-0 overflow-y-auto">
          <div class="p-4">
            <%= if @view_mode == "canvas" do %>
              <h2 class="font-semibold mb-4">属性面板</h2>
              <%= if @selected_component do %>
                <div class="space-y-4">
                  <div>
                    <label class="text-sm text-slate-500">类型</label>
                    <p class="font-medium"><%= @selected_component.type %></p>
                  </div>
                  <div>
                    <label class="text-sm text-slate-500">配置</label>
                    <pre class="mt-1 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-40"><%= Jason.encode!(@selected_component.config, pretty: true) %></pre>
                  </div>
                </div>
              <% else %>
                <p class="text-sm text-slate-500">点击画布上的组件查看属性</p>
              <% end %>
            <% else %>
              <h2 class="font-semibold mb-4">组件树</h2>
              <div class="text-sm">
                <%= raw(render_component_tree(@current_schema, 0)) %>
              </div>
            <% end %>

            <!-- Schema 显示 -->
            <div class="mt-6 pt-4 border-t">
              <h3 class="font-semibold mb-2">JSON Schema</h3>
              <pre class="p-2 bg-slate-900 text-green-400 rounded text-xs overflow-auto max-h-80"><%= Jason.encode!(@current_schema, pretty: true) %></pre>
            </div>
          </div>
        </aside>
      </div>
    </div>
    """
  end

  # 渲染 Schema 为实际组件
  defp render_schema(%{"type" => "Page", "children" => children}, assigns) when is_list(children) do
    rendered_children = Enum.map(children, fn child ->
      render_schema(child, assigns)
    end)
    assigns = assign(assigns, :rendered_children, rendered_children)
    ~H"""
    <div class="space-y-4">
      <%= for child <- @rendered_children do %>
        <%= child %>
      <% end %>
    </div>
    """
  end

  defp render_schema(%{"type" => "Stack", "props" => props, "children" => children}, assigns) do
    gap = Map.get(props, "gap", "4")
    rendered_children = Enum.map(children, &render_schema(&1, assigns))
    assigns = assign(assigns, rendered_children: rendered_children, gap: gap)
    ~H"""
    <div class={"flex flex-col gap-#{@gap}"}>
      <%= for child <- @rendered_children do %><%= child %><% end %>
    </div>
    """
  end

  defp render_schema(%{"type" => "Grid", "props" => props, "children" => children}, assigns) do
    columns = Map.get(props, "columns", "3")
    gap = Map.get(props, "gap", "4")
    rendered_children = Enum.map(children, &render_schema(&1, assigns))
    assigns = assign(assigns, rendered_children: rendered_children, columns: columns, gap: gap)
    ~H"""
    <div class={"grid grid-cols-#{@columns} gap-#{@gap}"}>
      <%= for child <- @rendered_children do %><%= child %><% end %>
    </div>
    """
  end

  defp render_schema(%{"type" => "Card", "props" => props, "children" => children}, assigns) do
    class = Map.get(props || %{}, "className", "")
    rendered_children = Enum.map(children, &render_schema(&1, assigns))
    assigns = assign(assigns, rendered_children: rendered_children, class: class)
    ~H"""
    <div class={"rounded-lg border bg-card text-card-foreground shadow-sm #{@class}"}>
      <%= for child <- @rendered_children do %><%= child %><% end %>
    </div>
    """
  end

  defp render_schema(%{"type" => "CardHeader", "children" => children}, assigns) do
    rendered_children = Enum.map(children, &render_schema(&1, assigns))
    assigns = assign(assigns, :rendered_children, rendered_children)
    ~H"""
    <div class="flex flex-col space-y-1.5 p-6">
      <%= for child <- @rendered_children do %><%= child %><% end %>
    </div>
    """
  end

  defp render_schema(%{"type" => "CardTitle", "children" => text}, assigns) when is_binary(text) do
    assigns = assign(assigns, :text, text)
    ~H"<h3 class='text-2xl font-semibold leading-none tracking-tight'><%= @text %></h3>"
  end

  defp render_schema(%{"type" => "CardDescription", "children" => text}, assigns) when is_binary(text) do
    assigns = assign(assigns, :text, text)
    ~H"<p class='text-sm text-muted-foreground'><%= @text %></p>"
  end

  defp render_schema(%{"type" => "CardContent", "children" => children}, assigns) do
    rendered_children = Enum.map(children, &render_schema(&1, assigns))
    assigns = assign(assigns, :rendered_children, rendered_children)
    ~H"""
    <div class="p-6 pt-0">
      <%= for child <- @rendered_children do %><%= child %><% end %>
    </div>
    """
  end

  defp render_schema(%{"type" => "CardFooter", "children" => children}, assigns) do
    rendered_children = Enum.map(children, &render_schema(&1, assigns))
    assigns = assign(assigns, :rendered_children, rendered_children)
    ~H"""
    <div class="flex items-center p-6 pt-0 gap-2">
      <%= for child <- @rendered_children do %><%= child %><% end %>
    </div>
    """
  end

  defp render_schema(%{"type" => "Button", "props" => props, "children" => text}, assigns) when is_binary(text) do
    variant = Map.get(props || %{}, "variant", "default")
    class = Map.get(props || %{}, "className", "")
    base_class = "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 "
    variant_class = if variant == "outline", do: "border border-input bg-background hover:bg-accent", else: "bg-primary text-primary-foreground hover:bg-primary/90"
    assigns = assign(assigns, text: text, class: base_class <> variant_class <> " " <> class)
    ~H"<button class={@class}><%= @text %></button>"
  end

  defp render_schema(%{"type" => "Button", "children" => text}, assigns) when is_binary(text) do
    assigns = assign(assigns, :text, text)
    ~H"<button class='inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90'><%= @text %></button>"
  end

  defp render_schema(%{"type" => "Text", "props" => props, "children" => text}, assigns) when is_binary(text) do
    variant = Map.get(props || %{}, "variant", "body")
    class = case variant do
      "title" -> "text-xl font-semibold"
      "subtitle" -> "text-lg font-medium"
      _ -> "text-base"
    end
    assigns = assign(assigns, text: text, class: class)
    ~H"<p class={@class}><%= @text %></p>"
  end

  defp render_schema(%{"type" => "Text", "children" => text}, assigns) when is_binary(text) do
    assigns = assign(assigns, :text, text)
    ~H"<p><%= @text %></p>"
  end

  defp render_schema(%{"type" => "Label", "children" => text}, assigns) when is_binary(text) do
    assigns = assign(assigns, :text, text)
    ~H"<label class='text-sm font-medium'><%= @text %></label>"
  end

  defp render_schema(%{"type" => "Input", "props" => props}, assigns) do
    type = Map.get(props || %{}, "type", "text")
    placeholder = Map.get(props || %{}, "placeholder", "")
    assigns = assign(assigns, type: type, placeholder: placeholder)
    ~H"<input type={@type} placeholder={@placeholder} class='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm' />"
  end

  defp render_schema(%{"type" => "StatisticCard", "props" => props}, assigns) do
    title = Map.get(props, "title", "")
    value = Map.get(props, "value", "0")
    trend = Map.get(props, "trend", "up")
    change = Map.get(props, "change", "")
    trend_class = if trend == "up", do: "text-green-600", else: "text-red-600"
    assigns = assign(assigns, title: title, value: value, change: change, trend_class: trend_class)
    ~H"""
    <div class="rounded-lg border bg-card shadow-sm p-6">
      <div class="text-sm text-muted-foreground"><%= @title %></div>
      <div class="text-2xl font-bold"><%= @value %></div>
      <div class={"text-xs #{@trend_class}"}><%= @change %></div>
    </div>
    """
  end

  defp render_schema(_, assigns) do
    ~H"<div class='p-2 bg-yellow-100 text-yellow-800 text-xs rounded'>未知组件</div>"
  end

  # 渲染组件树 - 返回纯字符串，不使用 Phoenix.HTML.raw
  defp render_component_tree(%{"type" => type, "children" => children}, depth) when is_list(children) do
    indent = String.duplicate("  ", depth)
    children_html = Enum.map_join(children, "", &render_component_tree(&1, depth + 1))
    """
    <div class="text-slate-700">
      <span class="text-blue-600">#{indent}&lt;#{type}&gt;</span>
      #{children_html}
      <span class="text-blue-600">#{indent}&lt;/#{type}&gt;</span>
    </div>
    """
  end

  defp render_component_tree(%{"type" => type, "children" => text}, depth) when is_binary(text) do
    indent = String.duplicate("  ", depth)
    escaped_text = Phoenix.HTML.html_escape(text) |> Phoenix.HTML.safe_to_string()
    """
    <div class="text-slate-700">
      <span class="text-blue-600">#{indent}&lt;#{type}&gt;</span>
      <span class="text-slate-500">#{escaped_text}</span>
      <span class="text-blue-600">&lt;/#{type}&gt;</span>
    </div>
    """
  end

  defp render_component_tree(%{"type" => type}, depth) do
    indent = String.duplicate("  ", depth)
    """
    <div class="text-slate-700">
      <span class="text-blue-600">#{indent}&lt;#{type} /&gt;</span>
    </div>
    """
  end

  defp render_component_tree(_, _), do: ""

  # 事件处理
  def handle_event("set_view_mode", %{"mode" => mode}, socket) do
    {:noreply, assign(socket, view_mode: mode)}
  end

  def handle_event("select_demo", %{"demo_id" => demo_id}, socket) do
    demo = Enum.find(@demo_pages, fn d -> d.id == demo_id end)
    schema = if demo, do: demo.schema, else: %{"type" => "Page", "children" => []}
    {:noreply, assign(socket, selected_demo: demo_id, current_schema: schema)}
  end

  def handle_event("add_card", _params, socket) do
    {:noreply, push_event(socket, "add_component", %{
      type: "Card",
      x: 200 + :rand.uniform(200),
      y: 100 + :rand.uniform(200),
      width: 280,
      height: 180,
      fill: "#ffffff",
      stroke: "#e5e7eb",
      cornerRadius: 8,
      shadowColor: "rgba(0,0,0,0.1)",
      shadowBlur: 10,
      shadowOffsetY: 4
    })}
  end

  def handle_event("add_button", _params, socket) do
    {:noreply, push_event(socket, "add_component", %{
      type: "Button",
      x: 200 + :rand.uniform(200),
      y: 100 + :rand.uniform(200),
      width: 100,
      height: 36,
      fill: "#2563eb",
      cornerRadius: 6,
      text: "Button",
      textColor: "#ffffff"
    })}
  end

  def handle_event("add_text", _params, socket) do
    {:noreply, push_event(socket, "add_component", %{
      type: "Text",
      x: 200 + :rand.uniform(200),
      y: 100 + :rand.uniform(200),
      text: "Text Label",
      fontSize: 16,
      fill: "#1e293b"
    })}
  end

  def handle_event("export", _params, socket) do
    {:noreply, push_event(socket, "export_schema", %{})}
  end

  def handle_event("component_selected", %{"type" => type, "config" => config}, socket) do
    {:noreply, assign(socket, selected_component: %{type: type, config: config})}
  end

  def handle_event("canvas_updated", %{"components" => components}, socket) do
    {:noreply, assign(socket, components: components)}
  end

  def handle_event("zoom_changed", %{"zoom" => zoom}, socket) do
    {:noreply, assign(socket, zoom: zoom)}
  end

  def handle_event("schema_exported", %{"schema" => schema}, socket) do
    {:noreply, assign(socket, exported_schema: schema, current_schema: schema)}
  end

  defp demo_pages, do: @demo_pages
end
