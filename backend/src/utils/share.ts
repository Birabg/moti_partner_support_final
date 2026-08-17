interface BaseModel {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any | null>;
  update: (args: any) => Promise<any>;
}

export const makeBaseCrud = <T extends { id: string; isActive: boolean }>(
  model: BaseModel,
) => ({
  list: (where: Record<string, unknown> = {}, includeInactive = false) =>
    model.findMany({
      where: includeInactive ? where : { ...where, isActive: true },
      orderBy: { name: "asc" } as any,
    }) as Promise<T[]>,

  getById: (id: string) =>
    model.findUnique({ where: { id } }) as Promise<T | null>,

  deactivate: (id: string) =>
    model.update({ where: { id }, data: { isActive: false } }) as Promise<T>,

  reactivate: (id: string) =>
    model.update({ where: { id }, data: { isActive: true } }) as Promise<T>,
});
