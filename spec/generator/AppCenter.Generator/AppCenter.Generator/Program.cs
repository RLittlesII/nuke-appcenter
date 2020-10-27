using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Readers;

namespace AppCenter.Generator
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("https://raw.githubusercontent.com/microsoft/appcenter-cli/")
            };

            var stream = await httpClient.GetStreamAsync("master/swagger/bifrost.swagger.json");

// Read V3 as YAML
            var openApiDocument = new OpenApiStreamReader().Read(stream, out var diagnostic);

// Write V2 as JSON
            var outputString = openApiDocument.Serialize(OpenApiSpecVersion.OpenApi2_0, OpenApiFormat.Json);

            Console.Write(outputString);
        }
    }
    
}