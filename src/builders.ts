import {
  DataSource,
  Model,
  Schema,
  ScalarField,
  ObjectField,
  ScalarType,
  FieldKind,
  DataSourceProvider,
  DataSourceURLEnv,
  Generator,
  CallExpression,
  CUID,
  AUTO_INCREMENT,
  NOW,
  UUID,
  ScalarFieldDefault,
} from "./types";

const NAME_REGEXP = /[A-Za-z][A-Za-z0-9_]*/;

/** Creates a schema AST object */
export function createSchema(
  models: Model[],
  dataSource?: DataSource,
  generators: Generator[] = []
): Schema {
  return {
    dataSource,
    generators,
    models,
  };
}

/** Creates a model AST object */
export function createModel(
  name: string,
  fields: Array<ScalarField | ObjectField>
): Model {
  validateName(name);
  return {
    name,
    fields,
  };
}

/**
 * Creates a scalar field AST object
 * Validates given name argument
 */
export function createScalarField(
  name: string,
  type: ScalarType,
  isList: boolean = false,
  isRequired: boolean = false,
  isUnique: boolean = false,
  isId: boolean = false,
  isUpdatedAt: boolean = false,
  defaultValue: ScalarFieldDefault = null
): ScalarField {
  validateName(name);
  validateScalarDefault(type, defaultValue);
  return {
    name,
    isList,
    isRequired,
    isUnique,
    kind: FieldKind.Scalar,
    type,
    isId,
    isUpdatedAt,
    default: defaultValue,
  };
}

function validateScalarDefault(type: ScalarType, value: ScalarFieldDefault) {
  if (value === null) {
    return;
  }
  switch (type) {
    case ScalarType.String: {
      if (
        !(
          typeof value === "string" ||
          (value instanceof CallExpression &&
            (value.callee === UUID || value.callee === CUID))
        )
      ) {
        throw new Error(
          "Default must be a string or a call expression to uuid() or cuid()"
        );
      }
      return;
    }
    case ScalarType.Boolean: {
      if (typeof value !== "boolean") {
        throw new Error("Default must be a boolean");
      }
      return;
    }
    case ScalarType.Int: {
      if (
        !(
          typeof value === "number" ||
          (value instanceof CallExpression && value.callee === AUTO_INCREMENT)
        )
      ) {
        throw new Error(
          "Default must be a number or call expression to autoincrement()"
        );
      }
      return;
    }
    case ScalarType.Float: {
      if (!(typeof value == "number")) {
        throw new Error("Default must be a number");
      }
      return;
    }
    case ScalarType.DateTime: {
      if (
        !(
          typeof value === "string" ||
          (value instanceof CallExpression && value.callee === NOW)
        )
      ) {
        throw new Error(
          "Default must be a date-time string or a call expression to now()"
        );
      }
      return;
    }
    case ScalarType.Json: {
      if (typeof value !== "string") {
        throw new Error("Default must a JSON string");
      }
      return;
    }
    default: {
      throw new Error(`Unknown type ${type}`);
    }
  }
}

/**
 * Creates an object field AST object
 * Validates given name argument
 */
export function createObjectField(
  name: string,
  type: string,
  isList: boolean = false,
  isRequired: boolean = false,
  relationName: string | null = null,
  relationToFields: string[] = [],
  relationToReferences: string[] = [],
  relationOnDelete: "NONE" = "NONE"
): ObjectField {
  validateName(name);
  return {
    name,
    isList,
    isRequired,
    kind: FieldKind.Object,
    type,
    relationName,
    relationToFields,
    relationToReferences,
    relationOnDelete,
  };
}

function validateName(name: string): void {
  if (!name.match(NAME_REGEXP)) {
    throw new Error(
      `Invalid name: "${name}". Name must start with a letter and can contain only letters, numbers and underscores`
    );
  }
}

/** Creates a data source AST object */
export function createDataSource(
  name: string,
  provider: DataSourceProvider,
  url: string | DataSourceURLEnv
): DataSource {
  return {
    name,
    provider,
    url,
  };
}

/** Creates a generator AST object */
export function createGenerator(
  name: string,
  provider: string,
  output: string | null = null,
  binaryTargets: string[] = []
): Generator {
  return {
    name,
    provider,
    output,
    binaryTargets,
  };
}
