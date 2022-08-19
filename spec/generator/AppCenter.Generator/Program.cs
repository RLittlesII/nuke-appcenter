using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Readers;
using Nuke.CodeGeneration.Model;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace AppCenter.Generator
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .WriteTo.Console()
                .CreateLogger();

            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("https://raw.githubusercontent.com/microsoft/appcenter-cli/")
            };

            var stream = await httpClient.GetStreamAsync("master/swagger/bifrost.swagger.json");

// Read V3 as YAML
            var openApiDocument = new OpenApiStreamReader().Read(stream, out var diagnostic);

// Write V2 as JSON
            var outputString = openApiDocument.Serialize(OpenApiSpecVersion.OpenApi2_0, OpenApiFormat.Json);

            var filePath = Path.Combine("../../../", "appcenter.json");
            await File.WriteAllTextAsync( filePath, outputString);

            var tool = await ConvertToNukeTool(openApiDocument);

            var contents = System.Text.Json.JsonSerializer.Serialize(tool);
            // await File.WriteAllTextAsync(Path.Combine("", ""), contents);

            Log.Information("Done");
        }

        private static Task<Tool> ConvertToNukeTool(OpenApiDocument openApiDocument)
        {
            var appCenterTool = new Tool() {Name = "appcenter"};
            foreach (var openApiPath in openApiDocument.Paths)
            {
                var item = openApiPath.Value;
                foreach (var operation in item.Operations)
                {
                    // Log.Debug("Operation: {@Operation}", operation.Key);
                    foreach (var openApiTag in operation.Value.Tags)
                    {
                        appCenterTool
                            .Tasks
                            .Add(new Nuke.CodeGeneration.Model.Task
                            {
                                CommonPropertySets = new List<string>{operation.Value.OperationId},
                                Postfix = openApiTag.Name,
                                Help = openApiTag.Description
                            });

                        // Log.Debug("Tag: {@OpenApiTag}\n", openApiTag);
                    }
                }
            }

            return Task.FromResult( appCenterTool);
        }
    }
}