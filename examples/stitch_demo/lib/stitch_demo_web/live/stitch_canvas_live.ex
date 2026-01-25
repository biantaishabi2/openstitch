defmodule StitchDemoWeb.StitchCanvasLive do
  @moduledoc """
  Stitch Canvas 页面 - 使用 StitchCanvasComponent 展示无限画布

  从 priv/static/screens 文件夹读取静态 HTML 文件并在画布中展示。
  """
  use StitchDemoWeb, :live_view

  alias StitchDemoWeb.StitchCanvasComponent

  @impl true
  def mount(_params, _session, socket) do
    screens = load_screens()
    {:ok, assign(socket, screens: screens)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="flex flex-col h-screen bg-gray-50">
      <%!-- 工具栏 --%>
      <div class="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-4">
        <span class="font-semibold text-gray-700">Stitch Canvas</span>
        <span class="text-sm text-gray-400">|</span>
        <span class="text-sm text-gray-500"><%= length(@screens) %> 个页面</span>
        <div class="flex-1"></div>
        <button
          phx-click="reload"
          class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          刷新
        </button>
      </div>

      <%!-- 画布区域 - 使用 LiveComponent --%>
      <div class="flex-1">
        <.live_component
          module={StitchCanvasComponent}
          id="main-canvas"
          screens={@screens}
        />
      </div>
    </div>
    """
  end

  @impl true
  def handle_event("reload", _params, socket) do
    screens = load_screens()
    {:noreply, assign(socket, screens: screens)}
  end

  # 加载静态 HTML 文件列表
  defp load_screens do
    screens_path = Application.app_dir(:stitch_demo, "priv/static/screens")

    # 正则匹配 digest 文件名：xxx-[32位十六进制哈希].html
    digest_pattern = ~r/-[0-9a-f]{32}\.html$/

    case File.ls(screens_path) do
      {:ok, files} ->
        files
        |> Enum.filter(&String.ends_with?(&1, ".html"))
        |> Enum.reject(&(&1 == "index.html"))
        |> Enum.reject(&Regex.match?(digest_pattern, &1))
        |> Enum.sort()
        |> Enum.map(fn file ->
          title =
            file
            |> String.replace(".html", "")
            |> String.split("-")
            |> Enum.map(&String.capitalize/1)
            |> Enum.join(" ")

          %{file: file, title: title}
        end)

      {:error, _} ->
        []
    end
  end
end
