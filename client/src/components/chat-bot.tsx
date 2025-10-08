import { XIcon } from "lucide-react";
import { useState } from "react";

function ChatBot() {
  const [show, setShow] = useState<boolean>(false);

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
        className="w-full cursor-pointer flex items-center justify-between px-1 border-b-[1px] border-b-slate-200 rounded-t-2xl"
      >
        <span className="text-sm text-gray-600">AI Smart-bot</span>
        <div className="rounded-full bg-slate-500 p-[1px] hover:bg-slate-400 duration-150">
          <XIcon size={13} className="stroke-amber-50" />
        </div>
      </div>
      <div className="h-full flex flex-col items-center pb-[71px] relative rounded-t-md bg-slate-500/70 p-2 mt-2">
        <div className="overflow-auto max-h-full ">
          <pre className="max-w-fit whitespace-pre-wrap break-words font-sans max-h-full  text-sm text-white "></pre>
        </div>
        <div className="w-full absolute flex bottom-4 p-1 text-sm text-gray-100 rounded-b-md bg-slate-600/30 mt-auto">
          <textarea className="resize-none border-none outline-none  w-full  relative"></textarea>
          <button className=" bg-whit border-l-[2px] border-white hover:opacity-50 duration-200 border-l-white rounded-l-full px-2 text-xs py-1 ">
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
