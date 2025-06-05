import React, { useState } from 'react';
import { createCharacter } from '../../api/characters';
import { useAuth } from '../../contexts/AuthContext';

const CreateCharacter: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    race: 'human',
    class_: 'warrior',
    strength: 8,
    dexterity: 8,
    intelligence: 8
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      setIsSubmitting(true);
      await createCharacter(formData, token);
      onCreated();
    } catch (error) {
      console.error('Error creating character:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-character">
      <h3>Create New Character</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>Race:</label>
          <select
            value={formData.race}
            onChange={(e) => setFormData({...formData, race: e.target.value})}
          >
            <option value="human">Human</option>
            <option value="elf">Elf</option>
            <option value="dwarf">Dwarf</option>
            <option value="orc">Orc</option>
          </select>
        </div>
        
        <div>
          <label>Class:</label>
          <select
            value={formData.class_}
            onChange={(e) => setFormData({...formData, class_: e.target.value})}
          >
            <option value="warrior">Warrior</option>
            <option value="mage">Mage</option>
            <option value="rogue">Rogue</option>
            <option value="cleric">Cleric</option>
          </select>
        </div>
        
        <div>
          <label>Strength:</label>
          <input
            type="number"
            min="1"
            max="15"
            value={formData.strength}
            onChange={(e) => setFormData({...formData, strength: parseInt(e.target.value)})}
          />
        </div>
        
        <div>
          <label>Dexterity:</label>
          <input
            type="number"
            min="1"
            max="15"
            value={formData.dexterity}
            onChange={(e) => setFormData({...formData, dexterity: parseInt(e.target.value)})}
          />
        </div>
        
        <div>
          <label>Intelligence:</label>
          <input
            type="number"
            min="1"
            max="15"
            value={formData.intelligence}
            onChange={(e) => setFormData({...formData, intelligence: parseInt(e.target.value)})}
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Character'}
        </button>
      </form>
    </div>
  );
};

export default CreateCharacter;