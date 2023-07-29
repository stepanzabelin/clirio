import { ClirioCommonError, ClirioValidationError } from '../exceptions';
import { ExceptionContext } from './exception-context.type';

export interface ClirioException {
  catch(
    error: Error | ClirioCommonError | ClirioValidationError,
    context: ExceptionContext,
  ): void | never;
}
