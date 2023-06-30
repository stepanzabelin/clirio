import { ArgMetadata } from '../lib/ArgMetadata';
import { TargetMetadata } from '../lib/TargetMetadata';
import {
  ExceptionTargetData,
  PipeTargetData,
  ResultTargetData,
  TransformTargetData,
  ValidateTargetData,
  ParamTargetData,
  OptionTargetData,
  DescriptionTargetData,
  HiddenTargetData,
  ActionTargetData,
  OptionsArgData,
  ParamsArgData,
  HelperArgData,
} from '../types';

export const resultTargetMetadata = new TargetMetadata<ResultTargetData>(
  'result'
);
export const exceptionTargetMetadata = new TargetMetadata<ExceptionTargetData>(
  'exception'
);
export const pipeTargetMetadata = new TargetMetadata<PipeTargetData>('pipe');
export const validateTargetMetadata = new TargetMetadata<ValidateTargetData>(
  'validate'
);
export const transformTargetMetadata = new TargetMetadata<TransformTargetData>(
  'transform'
);

export const paramTargetMetadata = new TargetMetadata<ParamTargetData>('param');
export const optionTargetMetadata = new TargetMetadata<OptionTargetData>(
  'option'
);
export const actionTargetMetadata = new TargetMetadata<ActionTargetData>(
  'action'
);
export const descriptionTargetMetadata =
  new TargetMetadata<DescriptionTargetData>('description');
export const hiddenTargetMetadata = new TargetMetadata<HiddenTargetData>(
  'hidden'
);

export const optionsArgMetadata = new ArgMetadata<OptionsArgData>('options');
export const paramsArgMetadata = new ArgMetadata<ParamsArgData>('params');
export const helperArgMetadata = new ArgMetadata<HelperArgData>('helper');
