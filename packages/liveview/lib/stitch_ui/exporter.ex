defmodule StitchUI.Exporter.HEEx do
  @moduledoc false

  @event_map %{
    "onClick" => "phx-click",
    "onChange" => "phx-change",
    "onSubmit" => "phx-submit",
    "onBlur" => "phx-blur",
    "onFocus" => "phx-focus"
  }

  @attr_map %{
    "className" => "class",
    "htmlFor" => "for"
  }

  def export(schema) when is_map(schema) do
    render_node(schema, 0, %{})
  end

  defp render_node(nil, _indent, _context), do: ""

  defp render_node(text, indent, _context) when is_binary(text) do
    spaces = String.duplicate(" ", indent)
    "#{spaces}#{text}"
  end

  defp render_node(%{"type" => type} = node, indent, context) do
    props = Map.get(node, "props") || %{}
    slots = Map.get(node, "slots")
    children = Map.get(node, "children")
    id = Map.get(node, "id")

    {props, children} = normalize_node(type, props, children)
    props = apply_parent_context(type, props, context)
    child_context = build_child_context(type, props, context)

    component = map_component(type)
    attrs = render_attrs(props, id)

    inner =
      cond do
        is_map(slots) -> render_slots_for(type, slots, props, indent + 2, child_context)
        is_list(children) -> render_children(children, indent + 2, child_context)
        is_map(children) -> render_node(children, indent + 2, child_context)
        is_binary(children) -> render_node(children, indent + 2, child_context)
        true -> ""
      end

    spaces = String.duplicate(" ", indent)

    if inner == "" do
      "#{spaces}<.#{component}#{attrs} />"
    else
      "#{spaces}<.#{component}#{attrs}>\n#{inner}\n#{spaces}</.#{component}>"
    end
  end

  defp render_children(children, indent, context) do
    count = length(children)

    children
    |> Enum.with_index()
    |> Enum.map(fn {child, index} ->
      render_node(
        child,
        indent,
        Map.merge(context, %{child_index: index, siblings_count: count})
      )
    end)
    |> Enum.reject(&(&1 == ""))
    |> Enum.join("\n")
  end

  defp render_slots_for("Columns", slots, props, indent, context) do
    layout = Map.get(props, "layout", "1:1")
    ratios =
      case layout do
        "equal" -> []
        value -> String.split(value, ":") |> Enum.map(&String.to_integer/1)
      end

    slots
    |> Enum.sort_by(fn {key, _} -> slot_order(key) end)
    |> Enum.with_index()
    |> Enum.map(fn {{key, value}, index} ->
      spaces = String.duplicate(" ", indent)
      content = render_node(value, indent + 2, context)
      ratio = Enum.at(ratios, index, 1)
      "#{spaces}<div data-slot=\"#{key}\" style=\"flex: #{ratio}\">\n#{content}\n#{spaces}</div>"
    end)
    |> Enum.join("\n")
  end

  defp render_slots_for("Split", slots, props, indent, context) do
    ratio = Map.get(props, "ratio", "1:1")
    vertical = Map.get(props, "vertical", false)
    [first, second] = ratio |> String.split(":") |> Enum.map(&String.to_integer/1)

    {first_key, second_key} =
      if vertical do
        {"top", "bottom"}
      else
        {"left", "right"}
      end

    first_value = Map.get(slots, first_key)
    second_value = Map.get(slots, second_key)

    spaces = String.duplicate(" ", indent)

    [
      "#{spaces}<div data-slot=\"#{first_key}\" style=\"flex: #{first}\">\n#{render_node(first_value, indent + 2, context)}\n#{spaces}</div>",
      "#{spaces}<div data-slot=\"#{second_key}\" style=\"flex: #{second}\">\n#{render_node(second_value, indent + 2, context)}\n#{spaces}</div>"
    ]
    |> Enum.join("\n")
  end

  defp render_slots_for(_type, slots, _props, indent, context) do
    render_slots(slots, indent, context)
  end

  defp render_slots(slots, indent, context) do
    slots
    |> Enum.sort_by(fn {key, _} -> slot_order(key) end)
    |> Enum.map(fn {key, value} ->
      spaces = String.duplicate(" ", indent)
      content = render_node(value, indent + 2, context)
      "#{spaces}<div data-slot=\"#{key}\">\n#{content}\n#{spaces}</div>"
    end)
    |> Enum.join("\n")
  end

  defp apply_parent_context("TabsTrigger", props, context) do
    active_value = Map.get(context, :tabs_active) || Map.get(context, :parent_props, %{})["value"] ||
      Map.get(context, :parent_props, %{})["defaultValue"]
    maybe_put(props, "activeValue", active_value)
  end

  defp apply_parent_context("TabsContent", props, context) do
    active_value = Map.get(context, :tabs_active) || Map.get(context, :parent_props, %{})["value"] ||
      Map.get(context, :parent_props, %{})["defaultValue"]
    maybe_put(props, "activeValue", active_value)
  end

  defp apply_parent_context(
         "Step",
         props,
         %{parent_type: "Stepper", parent_props: parent_props, child_index: index, siblings_count: count}
       ) do
    props
    |> maybe_put("index", index)
    |> maybe_put("stepNumber", index + 1)
    |> maybe_put("currentStep", Map.get(parent_props, "currentStep"))
    |> maybe_put("orientation", Map.get(parent_props, "orientation"))
    |> maybe_put("isLast", index == count - 1)
  end

  defp apply_parent_context(
         "TimelineItem",
         props,
         %{parent_type: "Timeline", parent_props: parent_props, child_index: index, siblings_count: count}
       ) do
    props
    |> maybe_put("showConnector", index < count - 1)
    |> maybe_put("iconsize", Map.get(parent_props, "iconsize"))
  end

  defp apply_parent_context(_type, props, _context), do: props

  defp normalize_node("Markdown", props, children) when is_binary(children) do
    props =
      if Map.has_key?(props, "content") do
        props
      else
        Map.put(props, "content", children)
      end

    {props, nil}
  end

  defp normalize_node(_type, props, children), do: {props, children}

  defp build_child_context(type, props, context) do
    context =
      context
      |> Map.put(:parent_type, type)
      |> Map.put(:parent_props, props)

    tabs_active = tabs_active_value(type, props, context)

    if is_nil(tabs_active) do
      context
    else
      Map.put(context, :tabs_active, tabs_active)
    end
  end

  defp tabs_active_value("Tabs", props, _context) do
    Map.get(props, "value") || Map.get(props, "defaultValue")
  end

  defp tabs_active_value(_type, _props, context), do: Map.get(context, :tabs_active)

  defp slot_order(key) do
    case Integer.parse(to_string(key)) do
      {value, _} -> value
      :error -> to_string(key)
    end
  end

  defp render_attrs(props, id) do
    props
    |> maybe_put_id(id)
    |> Enum.map(&render_attr/1)
    |> Enum.reject(&(&1 == ""))
    |> Enum.join("")
  end

  defp maybe_put_id(props, nil), do: props
  defp maybe_put_id(props, id), do: Map.put_new(props, "id", id)

  defp render_attr({key, value}) when is_binary(value) do
    attr = map_attr(key)
    " #{attr}=\"#{escape_attr(value)}\""
  end

  defp render_attr({key, value}) when is_number(value) do
    attr = map_attr(key)
    " #{attr}={#{value}}"
  end

  defp render_attr({key, true}) do
    attr = map_attr(key)
    " #{attr}={true}"
  end

  defp render_attr({key, false}) do
    attr = map_attr(key)
    " #{attr}={false}"
  end

  defp render_attr({key, value}) do
    attr = map_attr(key)
    " #{attr}={#{inspect(value)}}"
  end

  defp map_attr(key) do
    cond do
      Map.has_key?(@event_map, key) -> @event_map[key]
      Map.has_key?(@attr_map, key) -> @attr_map[key]
      String.starts_with?(key, "data-") -> key
      String.starts_with?(key, "phx-") -> key
      true -> snake_case(key)
    end
  end

  defp map_component(type) do
    snake_case(type)
  end

  defp snake_case(str) do
    str
    |> String.replace(~r/([A-Z])/, "_\\1")
    |> String.downcase()
    |> String.trim_leading("_")
  end

  defp escape_attr(value) do
    value
    |> String.replace("&", "&amp;")
    |> String.replace("\"", "&quot;")
  end

  defp maybe_put(props, _key, nil), do: props
  defp maybe_put(props, key, value), do: Map.put_new(props, key, value)
end
