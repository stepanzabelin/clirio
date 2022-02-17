import { getClassSchema } from 'joi-class-decorators';
import { Constructor } from 'joi-class-decorators/internal/defs';

export const validateJoiClassSchema = <T extends Constructor<any>>(
  dto: T,
  values: any
): T['prototype'] => {
  const { error, value } = getClassSchema(dto).validate(values);

  if (error) {
    throw error;
  }

  return value;
};
