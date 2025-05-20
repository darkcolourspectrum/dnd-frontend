import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCharacter from '../components/SessionLobby/CreateCharacter'

const CreateCharacterPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h2>Create New Character</h2>
      <CreateCharacter onCreated={() => navigate('/')} />
    </div>
  );
};

export default CreateCharacterPage;