import { Configuration, OpenAIApi } from "openai";
import CliState from "../CliState.js";
import ConfigService from "./ConfigService.js";
import { encode } from "gpt-3-encoder";
import SystemMessage from "./SystemMessage.js";

export default class OpenAiGptService {
  static async call(prompt, model, requestJsonOutput = true) {
    if (model == "gpt3") model = "gpt-3.5-turbo";
    if (model == "gpt4") model = "gpt-4o";

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
      basePath: process.env.OPENAI_API_BASE || "https://api.openai.com/v1",
    });
    const verbose = CliState.verbose();
    const openai = new OpenAIApi(configuration);

    const config = await ConfigService.retrieveConfig();
    const encoded = encode(prompt);
    const messages = requestJsonOutput
      ? [{ role: "user", content: prompt }, ...SystemMessage.systemMessages()]
      : [{ role: "user", content: prompt }];
    if (verbose)
      console.log(
        `Prompt token count: ${encoded.length}\n\nMessages sent to the OpenAI API:\n${messages.map((m) => `\n${m.role}\n--------\n${m.content}`).join("\n================\n\n")}\n\n`,
      );

    let response;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      try {
        response = await openai.createChatCompletion({
          model: model,
          temperature: config.api.temperature,
          messages: messages,
          functions: [
            {
              name: "crud_operations",
              description: "Create, update, or delete one or more files",
              parameters: {
                type: "object",
                properties: {
                  operations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        crudOperation: {
                          type: "string",
                          enum: ["create", "read", "update", "delete"],
                        },
                        filePath: {
                          type: "string",
                        },
                        fileContents: {
                          type: "string",
                        },
                      },
                      required: ["crudOperation", "filePath", "fileContents"],
                    },
                  },
                },
              },
            },
          ],
          function_call: { name: "crud_operations" },
        });

        if (response?.data?.choices) break;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          retries += 1;
          const retryAfter = error.response.headers["retry-after"]
            ? parseInt(error.response.headers["retry-after"], 10)
            : 2 ** retries;
          console.log(
            `Rate limit exceeded. Retrying after ${retryAfter} seconds...`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000),
          );
        } else {
          throw error;
        }
      }
    }

    if (!response?.data?.choices) return null;
    const responseBody =
      response.data.choices[0].message.function_call.arguments;
    if (verbose) console.log(responseBody);
    return responseBody;
  }
}
