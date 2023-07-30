import { ClirioCommonError, ClirioValidationError } from '../exceptions';
import { FilterContext } from './filter-context.type';

export interface ClirioFilter {
  catch(
    error: Error | ClirioCommonError | ClirioValidationError,
    context: FilterContext,
  ): void | never;
}
