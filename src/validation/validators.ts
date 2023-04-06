import addWorkdaysRequest from './request/addWorkdaysRequest.js';
import getConfigRequest from './request/getConfigRequest.js';
import putConfigRequest from './request/putConfigRequest.js';
import isWorkdayRequest from './request/isWorkdayRequest.js';

const VALIDATOR_OPTIONS = {
  convert: true,
};

export const validateGetConfigRequest = (request: any) => getConfigRequest
  .validateAsync(request, VALIDATOR_OPTIONS);

export const validatePutConfigRequest = (request: any) => putConfigRequest
  .validateAsync(request, VALIDATOR_OPTIONS);

export const validateAddWorkdaysRequest = (request: any) => addWorkdaysRequest
  .validateAsync(request, VALIDATOR_OPTIONS);

export const validateIsWorkdayRequest = (request: any) => isWorkdayRequest
  .validateAsync(request, VALIDATOR_OPTIONS);
