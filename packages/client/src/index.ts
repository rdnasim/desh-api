export { createDeshClient, DeshClient } from './client.js';
export { DeshApiError, type DeshErrorPayload } from './errors.js';
export type { ApiResponse, ApiResponseMeta, ClientConfig } from './types.js';

import { createDeshClient } from './client.js';
export default createDeshClient;
