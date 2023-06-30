import {
  ClirioError,
  ClirioRouteError,
  ClirioValidationError,
} from '../exceptions';
import { ExceptionContext } from './ExceptionContext';

export interface ClirioException {
  catch(
    error: Error | ClirioError | ClirioRouteError | ClirioValidationError,
    context: ExceptionContext
  ): void | never;
}
