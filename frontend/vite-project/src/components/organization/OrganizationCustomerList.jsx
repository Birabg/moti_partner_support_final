export default function OrganizationCustomerList({
  customers,
}) {
  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        No Customers Found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-4xl font-bold mb-6">
        Customers
      </h1>

      <div className="space-y-5">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="border rounded-lg p-5"
          >
            <h2 className="font-bold text-xl">
              {customer.fullName}
            </h2>

            <p>{customer.email}</p>

            <p>
              Status :
              {" "}
              {customer.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}