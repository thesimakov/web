/**
 * Результат режима codegen (валидация Zod до UI).
 */
export type CodegenFile = {
  path: string;
  content: string;
};

export type CodegenPayload = {
  files: CodegenFile[];
};
