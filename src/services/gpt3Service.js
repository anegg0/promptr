import { Configuration, OpenAIApi } from "openai"
import CliState from "../cliState.js";
import ConfigService from "./configService.js"
import { encode } from "gpt-3-encoder"

export default class Gpt3Service {
  static async call(prompt) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    })
    const verbose = CliState.verbose()
    const openai = new OpenAIApi(configuration)
    
    const config = await ConfigService.retrieveConfig();
    const encoded = encode(prompt)
    if (verbose) console.log(`Prompt token count: ${encoded.length}`)
    const promptLength = encoded.length 
    const apiConfig = {
      ...config.api,
      prompt: prompt,
      max_tokens: (4096 - promptLength),
    }
    if (verbose) console.log(`GPT-3 apiConfig: ${JSON.stringify(apiConfig)}`)    
    const response = await openai.createCompletion(apiConfig)

    if (!response?.data?.choices) return null
    let result = response.data.choices
      .map((d) => d?.text?.trim())
      .join()

    if (verbose) console.log(`--Response--\n${result}`)
    return result
  }
}
