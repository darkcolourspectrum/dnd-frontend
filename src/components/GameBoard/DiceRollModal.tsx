import React, { useState } from 'react';
import { rollDice } from '../../api/dice'; 

interface DiceRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoll: (result: number) => void;
}

const DiceRollModal: React.FC<DiceRollModalProps> = ({ isOpen, onClose, onRoll }) => {
  const [diceType, setDiceType] = useState('d20');
  const [result, setResult] = useState<number | null>(null);

  const handleRoll = async () => {
    const res = await rollDice(diceType);
    setResult(res.total);
    onRoll(res.total);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Бросок кубиков</h3>
        <select value={diceType} onChange={(e) => setDiceType(e.target.value)}>
          <option value="d4">d4</option>
          <option value="d6">d6</option>
          <option value="d8">d8</option>
          <option value="d10">d10</option>
          <option value="d12">d12</option>
          <option value="d20">d20</option>
          <option value="d100">d100</option>
        </select>
        
        <button onClick={handleRoll}>Бросить</button>
        {result && <p>Результат: {result}</p>}
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default DiceRollModal;