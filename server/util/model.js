import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  createEventTool,
  findAndDeleteEventTool,
  getEventTool,
} from "./tools.js";
import errorHandler from "./error-handler.js";

const tools = [getEventTool, createEventTool, findAndDeleteEventTool];

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

export async function handleLlm(req, res, next) {
  try {
    const { userInput, thread_id } = req.body;

    let config = { configurable: { thread_id } };

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
      result?.messages[result?.messages.length - 1].content
    );
    return res.json({
      message: result?.messages[result?.messages.length - 1].content,
    });
  } catch (error) {
    next(errorHandler(500, error));
  }
}
