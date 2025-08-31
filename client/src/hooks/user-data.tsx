import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { UserDataType, UserDecodeType } from "../../type";

const UserDataContext = createContext<{
  data: UserDataType | null;
  getToken: () => void;
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

  const getToken = () => {
    const getToken = JSON.parse(localStorage.getItem("user-info") as string);

    if (getToken?.token) {
      const result = decodeToken(getToken?.token);

      if (result?.success && result?.data) {
        const { userEmail, userRole, avatarUrl, fullName } =
          result?.data as UserDecodeType;

        if (result?.data) {
          setUserData({
            email: userEmail,
            name: fullName,
            img: avatarUrl,
            role: userRole,
          });
        } else {
          setUserData(null);
        }
      }
    } else {
      setUserData(null);
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  return (
    <UserDataContext.Provider value={{ data: userData || null, getToken }}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserDataProviders;
