export type Wallet = {
  id: number;
  currentBalance: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    isKycVerified: boolean;
    nid: string | null;
  };
};

export type Transaction = {
  id: number;
  senderWallet: {
    id: number;
    currentBalance: number;
  };
  receiverWallet: {
    id: number;
    currentBalance: number;
  };
  amount: number;
  status: string;
  category: string | null;
  timestamp: string;
  otp?: string;
  otpExpiry?: string;
};

export type TransactionHistoryResponse = {
  content: Transaction[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export type TransferRequest = {
  senderWalletId: number;
  receiverWalletId: number;
  amount: number;
  category: string;
  pin: string;
};

export type TransferResponse =
  | string
  | {
      message?: string;
      transactionId?: number;
      requiresOtp?: boolean;
      otpRequired?: boolean;
      status?: string;
    };
