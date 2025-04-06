import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true }); // Triggers component rerender
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-white bg-red-500 px-4 py-1 rounded"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
