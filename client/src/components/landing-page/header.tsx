"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Link } from "react-router";
import NavbarPage from "./navbar";

function HeaderPage() {
  const [isScroll, setIsScroll] = useState(false);
  // const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleScroll(e: Event) {
      setIsScroll(window.scrollY > 0);
    }

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "w-full  sticky top-0 z-[100] border-b-[1px] duration-100",
        isScroll
          ? "bg-slate-200/[0.5] backdrop-blur-sm border-b-slate-200"
          : " border-b-transparent"
      )}
    >
      <div
        className={cn(
          "max-w-[1280px] mx-auto flex p-2  items-center justify-between"
        )}
      >
        <Link
          to={"/"}
          className="focus-visible:outline-none flex items-center gap-x-1 sm:gap-x-3"
        >
          <div className="relative sm:w-20 sm:h-20  w-16 h-16">
            {/* <img
              draggable="false"
              alt="/icons/maskable-icon.png"
              src={"/icons/maskable-icon.png"}
              className="object-cover scale-[150%] sm:scale-[155%] aspect-square"
            /> */}
          </div>
          <h1 className=" font-semibold text-lg sm:text-2xl">Leave Tracker</h1>
        </Link>

        <NavbarPage />
      </div>
    </header>
  );
}

export default HeaderPage;
