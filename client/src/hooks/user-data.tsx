import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { UserDataType, UserDecodeType } from "../../type";
import { toast } from "sonner";

const UserDataContext = createContext<{
  data: UserDataType | null;
  getToken: () => void;
  isLoading: boolean;
} | null>(null);
const decodeToken = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    return {
      success: true,
      data: decoded,
    };
  } catch (error: any | Error) {
    console.error({
      success: false,
      error: error.message,
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

export const useUserData = () => {
  return useContext(UserDataContext);
};

function UserDataProviders({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    const getToken = JSON.parse(localStorage.getItem("user-info") as string);

    if (getToken?.token) {
      const result = decodeToken(getToken?.token);

      if (result?.success && result?.data) {
        const { userEmail, userRole, avatarUrl, fullName, id, createdAt } =
          result?.data as UserDecodeType;

        if (result?.data) {
          setUserData({
            email: userEmail,
            name: fullName,
            img: avatarUrl,
            role: userRole,
            id,
            createdAt,
          });
        } else {
          setUserData(null);
        }
      } else if (result?.error === "TokenExpiredError") {
        localStorage.removeItem("user-info");
        toast.error("Your session has expired. Please log in again.");
        setUserData(null);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setUserData(null);
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  return (
    <UserDataContext.Provider
      value={{ data: userData || null, getToken, isLoading }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export default UserDataProviders;
