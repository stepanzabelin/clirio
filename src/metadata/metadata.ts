import { ArgMetadata, EntityMetadata, TargetMetadata } from '../classes';
import {
  FilterTargetData,
  PipeTargetData,
  TransformTargetData,
  ValidateTargetData,
  CommandTargetData,
  ParamTargetData,
  ParamsArgData,
  OptionTargetData,
  OptionsArgData,
  EnvTargetData,
  EnvsArgData,
  HelperArgData,
  ModuleData,
} from '../types';

export const filterTargetMetadata = new TargetMetadata<FilterTargetData>(
  'filter',
);
export const pipeTargetMetadata = new TargetMetadata<PipeTargetData>('pipe');
export const validateTargetMetadata = new TargetMetadata<ValidateTargetData>(
  'validate',
);
export const transformTargetMetadata = new TargetMetadata<TransformTargetData>(
  'transform',
);
export const paramsArgMetadata = new ArgMetadata<ParamsArgData>('params');
export const paramTargetMetadata = new TargetMetadata<ParamTargetData>('param');
export const optionsArgMetadata = new ArgMetadata<OptionsArgData>('options');
export const optionTargetMetadata = new TargetMetadata<OptionTargetData>(
  'option',
);
export const envsArgMetadata = new ArgMetadata<EnvsArgData>('envs');
export const envTargetMetadata = new TargetMetadata<EnvTargetData>('env');
export const commandTargetMetadata = new TargetMetadata<CommandTargetData>(
  'command',
);
export const emptyTargetMetadata = new TargetMetadata<Record<string, never>>(
  'empty',
);
export const failureTargetMetadata = new TargetMetadata<Record<string, never>>(
  'failure',
);
export const helperArgMetadata = new ArgMetadata<HelperArgData>('helper');
export const moduleEntityMetadata = new EntityMetadata<ModuleData>('module');
