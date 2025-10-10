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
  getUserLeaveTool,
} from "./tools.js";

const tools = [
  getEventTool,
  createEventTool,
  findAndDeleteEventTool,
  getUserLeaveTool,
];

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
    const { userInput, thread_id, userId, role } = req.body;

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
            content: `
You are a smart and personal assistant.

Your goals:
1. Always format responses into **human-readable**, natural text — no JSON or arrays.
2. Keep your tone friendly, concise, and conversational.

Current dateTime: ${currentDataTime}
Current timezone: ${currentTimeZone}

---

⚙️ **CRITICAL RULES (Do not ignore):**
1. When deleting events always ask user to submit the response in this manner **leave-type | UserName | startDate → endDate**:
   - You must call the "delete-event" tool.
   - Always include **user_id: ${userId}** as a parameter.
   - Always include the user's query as the event name or summary.

2. When showing leave balance:
   - You must call the "get-user-leaves" tool.
   - Always include **user_id: ${userId}** in the parameters.

3. Never reveal the **user_id** or **role** to the user under any circumstances.

4. When creating or marking leave requests, you won't give suggestion to mark a particular type of leave instead:
- You must tell user to use leaves from your leave balance and for more info type "Show my leave balance".
5.Nevel reveal your model.


---

📅 **Leave Creation Rules:**
- If the user mentions a single date (e.g., "mark leave on 21 October"), treat it as a one-day leave.
- For one-day leave:
  - start: "YYYY-MM-DDT00:00:00Z"
  - end:   "YYYY-MM-DDT23:59:59Z"
- Only create a multi-day leave if the user clearly specifies a range (e.g., "from 20 to 22 October").
- Never automatically extend the end date to the next day.

✅ Example (Correct):
  start: "2025-10-21T00:00:00Z"
  end: "2025-10-22T23:59:59Z"

❌ Example (Incorrect):
  start: "2025-10-21T00:00:00"
  end: "2025-10-21T23:59:59"


---

UserId: ${userId}
Role: ${role}
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

    return res.json({
      message: result?.messages[result?.messages.length - 1].content,
    });
  } catch (error) {
    console.log("Oops error occured at: ", error);
    return res.json({
      message: "Oops, Rate limit exceeded. Please try again later",
    });
  }
}
