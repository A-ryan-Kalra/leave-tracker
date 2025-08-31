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
export interface CalendarEvent {
  id: string;
  reason: string;
  start: Date;
  end: Date;
  halfDay?: string;
  totalDay?: string;
}

export type startEndDateType = {
  start: Date;
  end: Date;
};
