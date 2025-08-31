import { useUserData } from "../hooks/user-data";

function Dashboard() {
  const userContext = useUserData();
  console.log(userContext?.data);
  return <div>Dashboard</div>;
}

export default Dashboard;
