import { FaSearch } from "react-icons/fa";

export default function DivisionSearch({
  search,
  setSearch,
}) {
  return (
    <div className="relative">

      <FaSearch
        className="absolute left-4 top-4 text-gray-400"
      />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search division..."
        className="w-full border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-navy-500"
      />

    </div>
  );
}