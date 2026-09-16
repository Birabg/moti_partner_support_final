import { FaSearch } from "react-icons/fa";

export default function DivisionSearch({
  search,
  setSearch,
}) {
  return (
    <div className="relative w-full">
      <FaSearch
        className="
          pointer-events-none
          absolute
          left-3.5
          top-1/2
          -translate-y-1/2
          text-[13px]
          text-slate-400
        "
      />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search divisions..."
        className="
          w-full
          h-11
          rounded-xl
          border border-slate-200
          bg-white
          pl-10
          pr-4
          text-sm
          font-medium
          text-slate-800
          placeholder:text-slate-400
          shadow-[0_1px_2px_rgba(15,23,42,0.02)]
          outline-none
          transition-all duration-200

          hover:border-slate-300

          focus:border-blue-400
          focus:ring-4
          focus:ring-blue-500/10
        "
      />
    </div>
  );
}