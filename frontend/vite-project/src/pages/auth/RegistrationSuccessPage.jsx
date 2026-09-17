export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-sm text-center">
        <h1 className="text-4xl font-bold mb-5">
          Registration Successful
        </h1>

        <p className="text-lg">
          Thank you for registering.
        </p>

        <p className="mt-3">
          A verification email has been sent to your inbox.
        </p>

        <p className="mt-3">
          Please verify your email within 24 hours.
        </p>
      </div>
    </div>
  );
}
