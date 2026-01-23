defmodule StitchUI.Components.CodeBlock do
  use Phoenix.Component

  attr :code, :string, required: true
  attr :language, :string, default: "typescript"
  attr :filename, :string, default: nil
  attr :show_line_numbers, :boolean, default: true
  attr :class, :string, default: nil
  attr :rest, :global

  def code_block(assigns) do
    ~H"""
    <div class={["relative rounded-lg border bg-zinc-950 text-sm overflow-hidden", @class]} data-language={@language} {@rest}>
      <div class="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <div class="flex items-center gap-2">
          <div class="flex gap-1.5">
            <div class="h-3 w-3 rounded-full bg-red-500"></div>
            <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div class="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <%= if @filename do %>
            <span class="ml-2 text-xs text-zinc-400"><%= @filename %></span>
          <% end %>
        </div>
        <button
          type="button"
          data-code-copy="true"
          class="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </button>
      </div>
      <div
        class={[
          "overflow-x-auto p-4",
          @show_line_numbers &&
            "[&_pre]:!pl-12 [&_code]:relative [&_.line]:before:absolute [&_.line]:before:left-0 [&_.line]:before:w-8 [&_.line]:before:text-right [&_.line]:before:text-zinc-600 [&_.line]:before:pr-4 [&_.line]:before:content-[counter(line)] [&_.line]:before:[counter-increment:line] [&_code]:[counter-reset:line]"
        ]}
      >
        <pre class="text-zinc-100"><code><%= @code %></code></pre>
      </div>
    </div>
    """
  end

  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def inline_code(assigns) do
    ~H"""
    <code class={["relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", @class]} {@rest}>
      <%= render_slot(@inner_block) %>
    </code>
    """
  end
end
