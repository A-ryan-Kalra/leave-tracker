import { useEffect } from "react";
import { useUserData } from "../hooks/user-data";
import { useNavigate } from "react-router";

function Dashboard() {
  const navigate = useNavigate();
  const userData = useUserData();

  useEffect(() => {
    userData?.getToken();
  }, []);
  console.log(userData?.data);
  if (!userData?.data) {
    navigate("/");
  }
  return <div>Dashboard</div>;
}

export default Dashboard;
