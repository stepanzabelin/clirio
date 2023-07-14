import { ClirioError, ClirioValidationError } from '../exceptions';
import { ExceptionContext } from './exception-context.type';

export interface ClirioException {
  catch(
    error: Error | ClirioError | ClirioValidationError,
    context: ExceptionContext,
  ): void | never;
}
