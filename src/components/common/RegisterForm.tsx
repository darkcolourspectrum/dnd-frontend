import React, { useState } from 'react';

interface RegisterFormProps {
  onRegister: (nickname: string, email: string, password: string) => void;
  onSwitch: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitch }) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(nickname, email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация</h2>
      <input
        placeholder="Никнейм"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Зарегистрироваться</button>
      <button type="button" onClick={onSwitch}>
        Уже есть аккаунт? Войти
      </button>
    </form>
  );
};

export default RegisterForm;