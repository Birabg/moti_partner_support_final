export default function EmptyOrganization() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <h1 className="text-4xl font-bold">
        No Organizations Found
      </h1>

      <p className="text-gray-500 mt-5">
        Create your first organization to
        begin managing customer accounts.
      </p>
    </div>
  );
}