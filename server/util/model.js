import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import readLine from "node:readline/promises";

dotenv.config();

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

async function callModel(state) {
  const response = await model.invoke(state.messages);

  return { messages: [response] };
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("assistant", callModel)
  .addEdge("__start__", "assistant")
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

    if (userInput === "quit") {
      break;
    }

    const result = await app.invoke(
      {
        messages: [
          { role: "system", content: `You are a smart Personal assistant.` },
          {
            role: "user",
            content: userInput,
          },
        ],
      },
      config
    );

    console.log("Ai response: ", result);
  }

  rl.close();
}

main();
