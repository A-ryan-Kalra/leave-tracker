import { useState } from "react";

function Hero() {
  const [takePriority, setTakePriority] = useState(false);

  // useEffect(() => {
  //   navigate("/login");
  // }, []);
  return (
    <div className="max-w-[1280px] mx-auto  flex flex-col gap-y-7 p-2 items-center pt-24 justify-center">
      <div className="flex max-md:flex-col items-center">
        <h1 className="sm:text-5xl text-3xl font-[1000]">Leaves.Approve.</h1>
        <span className=" sm:text-5xl text-3xl bg-gradient-to-r bg-clip-text font-[1000] text-transparent from-teal-700 to-pink-600  via-purple-900">
          Simple.
        </span>
      </div>
      <p className="tracking-wide text-xl text-zinc-600 text-center">
        LeaveTrack - Simplifying time-off for modern teams.
        <br />
        Request, approve, and track leaves in real time with smart automation,
        google calendar sync, and effortless transparency.
        <br /> No spreadsheets, no hassle—just smooth leave management that
        keeps work and life in balance.
      </p>
      <div className="relative pt-12 sm:pt-24 h-full max-sm:h-[400px] sm:h-[700px] lg:h-[1000px]  w-full mt-10">
        <div
          className={`absolute shadow-lg shadow-slate-400   rounded-lg  duration-700 ease-in-out transition-all w-full h-auto sm:h-auto overflow-hidden bg-transparent ${
            takePriority
              ? "scale-[1] z-[10] translate-y-5 sm:translate-y-10"
              : "md:hover:-translate-y-14 scale-[.95] opacity-[.8] -translate-y-1 sm:-translate-y-7"
          }`}
          onClick={() => {
            if (!takePriority) setTakePriority((prev) => !prev);
          }}
        >
          <div className="relative w-full h-full shadow-2xl shadow-black">
            <img
              width={0}
              height={0}
              draggable={false}
              sizes="100vw"
              className="h-auto w-auto pointer-events-none"
              src={"/app-cal.png"}
              alt="/app-cal.png"
            />
          </div>
        </div>
        <div
          onClick={() => {
            if (takePriority) setTakePriority((prev) => !prev);
          }}
          className={`absolute shadow-lg shadow-slate-400 rounded-xl w-full h-auto sm:h-auto overflow-hidden bg-transparent duration-700 ease-in-out transition-all ${
            !takePriority
              ? "scale-[1] z-[10]  translate-y-5 sm:translate-y-10"
              : "md:hover:-translate-y-14 -translate-y-1 sm:-translate-y-7 opacity-[.8]  scale-[.95]"
          } `}
        >
          <div className="relative w-full h-full">
            <img
              width={0}
              height={0}
              draggable={false}
              sizes="100vw"
              className="h-auto w-auto pointer-events-none shadow-2xl shadow-black"
              src={"/google-cal.png"}
              alt="/google-cal.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
