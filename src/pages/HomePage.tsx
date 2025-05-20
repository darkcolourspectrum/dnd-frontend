import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"

const HomePage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1>DnD Multiplayer</h1>
      {token ? (
        <>
          <button onClick={() => navigate("/create-session")}>Создать игру</button>
          <button onClick={logout}>Выйти</button>
        </>
      ) : (
        <button onClick={() => navigate("/auth")}>Войти</button>
      )}
    </div>
  );
};

export default HomePage;