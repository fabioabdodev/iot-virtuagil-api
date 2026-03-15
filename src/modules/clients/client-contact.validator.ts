import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { isValidCpfOrCnpj, isValidPhone } from './client-contact.utils';

@ValidatorConstraint({ name: 'clientDocument', async: false })
class ClientDocumentConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && isValidCpfOrCnpj(value);
  }

  defaultMessage() {
    return 'Documento invalido. Informe um CPF ou CNPJ valido';
  }
}

@ValidatorConstraint({ name: 'clientPhone', async: false })
class ClientPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && isValidPhone(value);
  }

  defaultMessage() {
    return 'Telefone invalido. Use um telefone com DDD';
  }
}

export function IsClientDocument(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'clientDocument',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ClientDocumentConstraint,
    });
  };
}

export function IsClientPhone(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'clientPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ClientPhoneConstraint,
    });
  };
}
