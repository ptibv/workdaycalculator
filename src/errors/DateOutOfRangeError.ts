import ClientError from './ClientError';

class DateOutOfRangeError extends ClientError {
  name = 'DateOutOfRangeError';
}

export default DateOutOfRangeError;
