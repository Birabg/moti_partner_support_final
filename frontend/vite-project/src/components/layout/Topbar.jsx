import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function Topbar() {

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    async function handleLogout() {

        await logout();

        navigate("/login");

    }

    return (

        <header className="bg-white shadow px-6 py-4 flex justify-between">

            <div>

                Welcome,

                <strong className="ml-2">

                    {user?.email}

                </strong>

            </div>

            <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded text-white"
            >

                Logout

            </button>

        </header>

    );

}
