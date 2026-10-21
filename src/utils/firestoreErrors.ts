export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
}

export interface FirestoreErrorInfo {
  operationType: OperationType;
  path: string | null;
  message: string;
  code?: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    operationType,
    path,
    message: error instanceof Error ? error.message : String(error),
    code: (error as any)?.code,
  };
  console.error(`Firestore Error [${operationType}] on path ${path || 'unknown'}:`, errInfo);
  return errInfo;
}
