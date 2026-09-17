export default function WelcomeBanner({ user }) {
  const name = user?.firstName || "Support";
  return (
    <div className="welcome-banner">
      <h2>Good Morning,</h2>
      <h1>{name}</h1>
      <p>PS Support Engineer</p>
    </div>
  );
}






