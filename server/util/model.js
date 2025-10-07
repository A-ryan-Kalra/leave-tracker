import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import readLine from "node:readline/promises";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createEventTool, getEventTool } from "./tools.js";

dotenv.config();

const tools = [getEventTool, createEventTool];

const model = new ChatGroq({
  model: process.env.LLL_MODEL,
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
}).bindTools(tools);

const toolNode = new ToolNode(tools);

async function callModel(state) {
  const response = await model.invoke(state.messages);

  return { messages: [response] };
}

function whereToGo(state) {
  const lastMessage = state.messages[state.messages.length - 1];

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("assistant", callModel)
  .addEdge("__start__", "assistant")
  .addNode("tools", toolNode)
  .addConditionalEdges("assistant", whereToGo, {
    __end__: "__end__",
    tools: "tools",
  })
  .addEdge("assistant", "__end__");

const checkpointer = new MemorySaver();

const app = graph.compile({ checkpointer });

async function main() {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let config = { configurable: { thread_id: 1 } };

  while (true) {
    const userInput = await rl.question("You: ");
    console.log("input", userInput);
    if (userInput == "bye") {
      break;
    }
    const currentDataTime = new Date()
      .toLocaleString("se-Se")
      .replace(" ", "T");

    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const result = await app.invoke(
      {
        messages: [
          {
            role: "system",
            content: `You are a smart Personal assistant.
            Current dateTime: ${currentDataTime}
            Current timezone: ${currentTimeZone}
            `,
          },
          {
            role: "user",
            content: userInput,
          },
        ],
      },
      config
    );

    console.log(
      "Ai response: ",
      JSON.parse(result?.messages[result?.messages.length - 1].content)
    );
  }

  rl.close();
}

main();
