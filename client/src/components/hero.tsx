import React, { useEffect } from "react";
import { useNavigate } from "react-router";

function Hero() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/login");
  }, []);
  return <div>Hero</div>;
}

export default Hero;
