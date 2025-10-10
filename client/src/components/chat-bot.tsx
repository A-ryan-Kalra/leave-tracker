import { useUserData } from "@/hooks/user-data";
import { api } from "@/utils/api";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { XIcon } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

type MessageType = { type: "user" | "assistant"; message: string };

function ChatBot() {
  const queryClient = useQueryClient();
  const [show, setShow] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [displayMessage, setDisplayMessage] = useState<string>("");
  const [isDisplayMessageEnd, setIsDisplayMessageEnd] =
    useState<boolean>(false);
  const [saveResponse, setSaveResponse] = useState<MessageType[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const clearTimeOut = useRef<boolean>(false);
  const stopScrolling = useRef<boolean>(false);
  const controllerRef = useRef<AbortController | null>(null);
  const storeDetails = useUserData();

  const refreshDashboardData = () => {
    queryClient.refetchQueries({
      queryKey: ["leaveRequests", storeDetails?.data?.id],
    });
  };
  const handleChatbot = async (e: FormEvent) => {
    e.preventDefault();
    clearTimeOut.current = false;
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;
    setIsThinking(true);
    setDisplayMessage("");
    setMessage("");
    setIsDisplayMessageEnd(true);
    setSaveResponse((prev) => [...prev, { type: "user", message }]);

    const thread_id = storeDetails?.data?.id;

    try {
      const res = await api.post(
        "/ask-bot",
        {
          userInput: message,
          thread_id,
          userId: storeDetails?.data?.id,
          role: storeDetails?.data?.role,
        },
        { signal: controller.signal }
      );
      setSaveResponse((prev) => [
        ...prev,
        { type: "assistant", message: res.data?.message },
      ]);
      const splitMessage = res.data?.message?.split("");
      splitMessage?.forEach((word: string, index: number) => {
        setTimeout(() => {
          if (!clearTimeOut.current) {
            setDisplayMessage((prev) => prev + word);
            if (splitMessage?.length - 1 === index) {
              setIsDisplayMessageEnd(false);
            }
          }
        }, index * 10);
      });
    } catch (error: any) {
      if (axios.isCancel(error) || error.name === "CanceledError") {
        console.log("Request Cancelled");
        toast("Request Cancelled");
      } else {
        console.log("Error occured at: ", error);
      }
    } finally {
      setIsThinking(false);
      refreshDashboardData();
    }
  };

  const isAtBottom = () => {
    const el = contentRef.current;
    if (!el) return false;

    if (
      Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) > 10 &&
      !stopScrolling.current
    ) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  isAtBottom();

  useEffect(() => {
    const handleUserScroll = () => {
      stopScrolling.current = true;
    };

    const el = contentRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleUserScroll, { passive: true });
    el.addEventListener("touchmove", handleUserScroll, { passive: true });
    el.addEventListener("keydown", handleUserScroll, { passive: true });

    return () => {
      el.removeEventListener("wheel", handleUserScroll);
      el.removeEventListener("touchmove", handleUserScroll);
      el.removeEventListener("keydown", handleUserScroll);
    };
  }, []);
  if (!storeDetails?.data?.id) return null;
  return (
    <div
      className={`bg-slate-800/40 backdrop-blur-3xl h-9 shadow-md duration-200 origin-bottom transform max-sm:w-[200px] md:w-[300px] fixed bottom-0 rounded-t-2xl p-2 right-6 z-20 ${
        show && "md:h-[400px] md:w-[500px] max-sm:h-[350px] max-sm:w-[300px]"
      }`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShow((prev) => !prev);
        }}
        className="w-full cursor-pointer flex items-center justify-between mx-1 py-0.5 border-b-[1px] border-b-slate-200 rounded-t-2xl"
      >
        <span className="text-sm text-neutral-50">Smart AI-bot</span>
        {show && (
          <div className="rounded-full bg-slate-500 p-[1px] mr-1  hover:bg-slate-400 duration-150">
            <XIcon size={13} className="stroke-amber-50" />
          </div>
        )}
      </div>
      <form
        onSubmit={handleChatbot}
        className="h-full flex flex-col items-center pb-[78px] relative rounded-t-md bg-slate-500/ p-2 mt-2"
      >
        <div
          ref={contentRef}
          style={{ scrollBehavior: "smooth" }}
          className="overflow-auto max-h-full w-full h-full"
        >
          <pre className="h-full flex flex-col gap-y-2 textdecora whitespace-pre-wrap break-words font-sans   text-sm text-white ">
            {/* {displayMessage} */}
            {!saveResponse.length && (
              <div className="items-center min-h-full relative gap-y-1 flex flex-col justify-center p-1">
                <div className="w-20 h-20 rounded-full bg-slate-300/12 backdrop-blur-lg p-3">
                  <img
                    src="/leave.png"
                    alt="/leave.png"
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-">
                  Namaste, how can I help you with leaves?
                </span>
              </div>
            )}

            {saveResponse?.map((res, index) => (
              <span key={index}>
                {res.type === "assistant" && (
                  <div
                    className="max-w-fit"
                    dangerouslySetInnerHTML={{
                      __html:
                        saveResponse.length - 1 === index
                          ? displayMessage
                          : res.message,
                    }}
                  ></div>
                )}
                {res.type === "user" && (
                  <div className="bg-slate-500 ml-auto max-w-fit px-2 py-1 rounded-xl">
                    {res.message}
                  </div>
                )}
              </span>
            ))}
            {isThinking && (
              <div className="text-lg text-gray-100 animate-pulse">
                Thinking
              </div>
            )}
            <div ref={bottomRef}></div>
          </pre>
        </div>
        <div className="w-full absolute flex bottom-[28px] p-1 text-sm text-gray-100 rounded-md bg-slate-700/20 mt-auto">
          <textarea
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleChatbot(e);
              }
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything about leave-tracker"
            className="resize-none border-none outline-none  w-full  relative"
          ></textarea>
          {!isDisplayMessageEnd && (
            <button
              onClick={handleChatbot}
              type="submit"
              className=" bg-whit border-l-[2px] border-white hover:opacity-50 duration-200 border-l-white rounded-l-full px-2 text-xs py-1 "
            >
              Ask
            </button>
          )}
          {isDisplayMessageEnd && (
            <button
              onClick={() => {
                controllerRef.current?.abort();
                setIsThinking(false);
                setIsDisplayMessageEnd(false);
                clearTimeOut.current = true;
              }}
              type="button"
              className=" bg-whit border-l-[2px] border-white hover:opacity-50 duration-200 border-l-white rounded-l-full px-2 text-xs py-1 "
            >
              Stop
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ChatBot;
