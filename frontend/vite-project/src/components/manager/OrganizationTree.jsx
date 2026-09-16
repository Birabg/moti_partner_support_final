import { Card, CardTitle, CardContent } from "../ui/card";

function TreeNode({ node, depth = 0 }) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
        style={{ marginLeft: depth * 18 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {node.type}
            </div>
            <div className="text-lg font-bold text-slate-900">{node.name}</div>
          </div>
          {typeof node.staffCount === "number" && (
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
              {node.staffCount} staff
            </span>
          )}
        </div>
      </div>

      {hasChildren && (
        <div className="space-y-3 border-l border-slate-200 pl-4">
          {node.children.map((child, index) => (
            <TreeNode key={`${child.type}-${child.name}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationTree({ snapshot }) {
  const scope = snapshot?.department || snapshot?.division || snapshot?.section || {};
  const hierarchy = snapshot?.hierarchyMetrics || {};

  const buildTree = () => {
    if (snapshot?.department) {
      return [
        {
          type: "Department",
          name: snapshot.department.name,
          staffCount: hierarchy.totalDepartmentStaffCount || 0,
          children: (hierarchy.divisions || []).map((division) => ({
            type: "Division",
            name: division.name,
            staffCount: division.staffCount || division.sections?.reduce((sum, section) => sum + (section.staffCount || 0), 0) || 0,
            children: (division.sections || []).map((section) => ({
              type: "Section",
              name: section.name,
              staffCount: section.staffCount || 0,
              children: [],
            })),
          })),
        },
      ];
    }

    if (snapshot?.division) {
      return [
        {
          type: "Division",
          name: snapshot.division.name,
          staffCount: hierarchy.totalDivisionStaffCount || 0,
          children: (hierarchy.sections || []).map((section) => ({
            type: "Section",
            name: section.name,
            staffCount: section.staffCount || 0,
            children: [],
          })),
        },
      ];
    }

    if (snapshot?.section) {
      return [
        {
          type: "Section",
          name: snapshot.section.name,
          staffCount: hierarchy.totalSectionStaffCount || 0,
          children: [],
        },
      ];
    }

    return [
      {
        type: "Organization",
        name: scope.name || "Organization",
        staffCount: hierarchy.totalSectionStaffCount || hierarchy.totalDivisionStaffCount || hierarchy.totalDepartmentStaffCount || 0,
        children: [],
      },
    ];
  };

  const tree = buildTree();

  return (
    <Card>
      <CardTitle>Scope</CardTitle>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {tree.map((node, index) => (
            <TreeNode key={`${node.type}-${node.name}-${index}`} node={node} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
