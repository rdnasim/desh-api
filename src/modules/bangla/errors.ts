import { ApiError } from '../../lib/errors';

export function invalid(param: string, message: string): never {
  throw new ApiError('invalid_parameter', `${param} ${message}`, {
    message_bn: 'প্যারামিটারটি সঠিক নয়',
    details: [{ path: param, message }],
  });
}
