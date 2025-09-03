export interface UserDataType {
  email: string;
  img: string;
  name: string;
  role: string;
  id: string;
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
  leaveType: string;
  start: Date;
  end: Date;
  fullname?: string;
  halfDay?: string;
  totalDay?: string;
  [key: string]: any;
}

export type startEndDateType = {
  start: Date;
  end: Date;
  totalDay?: number;
};
