export interface UserDataType {
  email: string;
  img: string;
  name: string;
  role: string;
}

export type UserDecodeType = {
  id: string;
  userEmail: string;
  userRole: string;
  avatarUrl: string;
  fullName: string;
};
