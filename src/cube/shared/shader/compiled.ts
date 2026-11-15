/// <reference types="@webgpu/types" />

/** `shader`'s compile errors on one line, or null where it compiled. */
async function compileErrors(shader: GPUShaderModule): Promise<string | null> {
  const { messages } = await shader.getCompilationInfo();
  const errors = messages.filter(({ type }) => type === 'error');
  if (errors.length === 0) return null;
  return errors
    .map(
      ({ lineNum, linePos, message }) =>
        `${String(lineNum)}:${String(linePos)} ${message}`,
    )
    .join('; ');
}

/**
 * `code` compiled on `device`; rejects with the compiler's words, said of
 * `what`, where it does not compile.
 */
export async function compiled(
  device: GPUDevice,
  what: string,
  code: string,
): Promise<GPUShaderModule> {
  const shader = device.createShaderModule({ label: what, code });
  const errors = await compileErrors(shader);
  if (errors !== null) throw new Error(`${what}: ${errors}`);
  return shader;
}
