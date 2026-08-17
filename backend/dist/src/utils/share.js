"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBaseCrud = void 0;
const makeBaseCrud = (model) => ({
    list: (where = {}, includeInactive = false) => model.findMany({
        where: includeInactive ? where : { ...where, isActive: true },
        orderBy: { name: "asc" },
    }),
    getById: (id) => model.findUnique({ where: { id } }),
    deactivate: (id) => model.update({ where: { id }, data: { isActive: false } }),
    reactivate: (id) => model.update({ where: { id }, data: { isActive: true } }),
});
exports.makeBaseCrud = makeBaseCrud;
