// src/types/index.ts
export type ConnectionState =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error'
    | 'retrying';

export interface ConnectionSliceState {
    connectionState: ConnectionState;
}

export enum TransactionState {
  PENDING = "pending",
  PROCESSING = "processing",
  APPROVED = "approved",
  NOT_APPROVED = "not_approved",
  PROCCESED = "processed",
  REJECTED = "rejected",
}
