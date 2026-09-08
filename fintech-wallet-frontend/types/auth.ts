export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isKycVerified: boolean;
  nid: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  transactionPin?: string;
};

export type ApiErrorDetails = {
  timestamp: string;
  message: string;
  details: string;
};

export type KycSubmissionRequest = {
  nid: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
};
