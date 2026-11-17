export interface DeshErrorPayload {
  code: string;
  message: string;
  message_bn?: string;
  details?: unknown;
}

export class DeshApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly messageBn?: string;
  readonly details?: unknown;

  constructor(status: number, payload: DeshErrorPayload) {
    super(payload.message || `API request failed with status ${status}`);
    this.name = 'DeshApiError';
    this.status = status;
    this.code = payload.code || 'unknown_error';
    this.messageBn = payload.message_bn;
    this.details = payload.details;
  }
}
