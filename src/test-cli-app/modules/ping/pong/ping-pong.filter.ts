import {
  ClirioCommonError,
  ClirioFilter,
  ClirioValidationError,
} from '@clirio';
import { FilterContext } from '../../../../types';

export class PingPingsFilter implements ClirioFilter {
  catch(
    error: Error | ClirioCommonError | ClirioValidationError,
    context: FilterContext,
  ): void | never {
    if (error instanceof ClirioValidationError) {
      console.log('Validation error', error.message);
      process.exit(9);
    }

    if (error instanceof ClirioCommonError) {
      console.log('Common error', error.message);
      process.exit(5);
    }

    console.log('unknown error', error.message);
    process.exit(1);
  }
}
