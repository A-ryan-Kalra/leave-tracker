import { api } from "@/utils/api";
import { XIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

type MessageType = { type: "user" | "assistant"; message: string };

function ChatBot() {
  const [show, setShow] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [saveResponse, setSaveResponse] = useState<MessageType[]>([]);

  const handleChatbot = async (e: FormEvent) => {
    e.preventDefault();
    setIsThinking(true);
    setSaveResponse((prev) => [...prev, { type: "user", message }]);

    const thread_id =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

    const res = await api.post("/ask-bot", { userInput: message, thread_id });
    console.log("data", res.data);
    setSaveResponse((prev) => [
      ...prev,
      { type: "assistant", message: res.data?.message },
    ]);
    setIsThinking(false);
    setMessage("");
  };
  console.log(saveResponse);
  return (
    <div
      className={`bg-slate-700/30 backdrop-blur-md h-9 shadow-md duration-200 origin-bottom transform  w-[300px] fixed bottom-0 rounded-t-2xl p-2 right-6 z-10 ${
        show && "h-[400px] w-[500px]"
      }`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShow((prev) => !prev);
        }}
        className="w-full cursor-pointer flex items-center justify-between mx-1 border-b-[1px] border-b-slate-200 rounded-t-2xl"
      >
        <span className="text-sm text-gray-600">AI Smart-bot</span>
        {show && (
          <div className="rounded-full bg-slate-500 p-[1px] hover:bg-slate-400 duration-150">
            <XIcon size={13} className="stroke-amber-50" />
          </div>
        )}
      </div>
      <form
        onSubmit={handleChatbot}
        className="h-full flex flex-col items-center pb-[71px] relative rounded-t-md bg-slate-500/70 p-2 mt-2"
      >
        <div className="overflow-auto max-h-full w-full h-full">
          <pre className="   whitespace-pre-wrap break-words font-sans   text-sm text-white ">
            {isThinking && (
              <div className="text-lg text-gray-100 animate-pulse">
                Thinking
              </div>
            )}
          </pre>
        </div>
        <div className="w-full absolute flex bottom-4 p-1 text-sm text-gray-100 rounded-b-md bg-slate-600/30 mt-auto">
          <textarea
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleChatbot(e);
              }
            }}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything about leave-tracker"
            className="resize-none border-none outline-none  w-full  relative"
          ></textarea>
          <button
            onClick={handleChatbot}
            type="submit"
            className=" bg-whit border-l-[2px] border-white hover:opacity-50 duration-200 border-l-white rounded-l-full px-2 text-xs py-1 "
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatBot;
