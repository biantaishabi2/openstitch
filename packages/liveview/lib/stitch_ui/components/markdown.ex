defmodule StitchUI.Components.Markdown do
  use Phoenix.Component

  import Phoenix.HTML, only: [raw: 1, safe_to_string: 1]

  attr :content, :string, default: ""
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block

  def markdown(assigns) do
    content =
      cond do
        is_binary(assigns.content) && String.trim(assigns.content) != "" ->
          assigns.content

        assigns.inner_block != [] ->
          assigns.inner_block |> render_slot() |> safe_to_string()

        true ->
          ""
      end

    html = Earmark.as_html!(content, %Earmark.Options{gfm: true, breaks: true})
    assigns = assign(assigns, :html, html)

    ~H"""
    <div class={["prose prose-sm max-w-none text-foreground", @class]} {@rest}>
      <%= raw(@html) %>
    </div>
    """
  end
end
