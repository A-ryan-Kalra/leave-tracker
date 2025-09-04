import { Github } from "lucide-react";

import { Link } from "react-router";

function Footer() {
  return (
    <footer className={`bg-white`}>
      <div className="flex relative justify-around items-center dark:border-white dark:text-white duration-300 py-5 border-t-2 border-black">
        <span className="md:text-xl text-[14px] flex items-center justify-center gap-x-1">
          Made with ❤️ &copy; {new Date().getFullYear()} Leave Tracker
          <Link
            target="__blank"
            to={"https://github.com/A-ryan-Kalra/leave-tracker"}
            className="bg-slate-300 rounded-full p-1 hover:bg-slate-200 cursor-pointer transition"
          >
            <Github className="fill-white w-4 sm:w-5 h-4 sm:h-5" />
          </Link>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
