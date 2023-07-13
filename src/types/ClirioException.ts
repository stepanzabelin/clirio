import { ClirioError, ClirioValidationError } from '../exceptions';
import { ExceptionContext } from './ExceptionContext';

export interface ClirioException {
  catch(
    error: Error | ClirioError | ClirioValidationError,
    context: ExceptionContext,
  ): void | never;
}
