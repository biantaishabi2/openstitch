defmodule Mix.Tasks.Stitch.Export do
  use Mix.Task

  @shortdoc "Export JSON Schema to HEEx template"

  @impl true
  def run(args) do
    {opts, files, _} = OptionParser.parse(args, switches: [output: :string])

    case files do
      [input_file] ->
        output = Keyword.get(opts, :output, "output.heex")

        schema =
          input_file
          |> File.read!()
          |> Jason.decode!()

        heex = StitchUI.Exporter.HEEx.export(schema)

        File.write!(output, heex)
        Mix.shell().info("Exported to #{output}")

      _ ->
        Mix.raise("Usage: mix stitch.export <schema.json> --output path.heex")
    end
  end
end
