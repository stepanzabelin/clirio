import { ClirioError, ClirioValidationError } from '../exceptions';
import { ClirioException } from '../types';
import { ExceptionContext } from '../types/ExceptionContext';

export class ClirioDefaultException implements ClirioException {
  catch(
    error: Error | ClirioError | ClirioValidationError,
    context: ExceptionContext
  ): void | never {
    if (
      error instanceof ClirioError ||
      error instanceof ClirioValidationError
    ) {
      console.log('\x1b[31m%s\x1b[0m', error.message);
    } else {
      throw error;
    }
  }
}
