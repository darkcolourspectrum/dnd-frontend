import React from 'react';

interface ControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onEndTurn: () => void;
  onRollDice: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onMove, onEndTurn, onRollDice }) => {
  return (
    <div className="controls">
      <div className="movement-controls">
        <button onClick={() => onMove('up')}>↑</button>
        <div>
          <button onClick={() => onMove('left')}>←</button>
          <button onClick={() => onMove('right')}>→</button>
        </div>
        <button onClick={() => onMove('down')}>↓</button>
      </div>
      <div className="action-controls">
        <button onClick={onRollDice}>Бросить кубик</button>
        <button onClick={onEndTurn}>Завершить ход</button>
      </div>
    </div>
  );
};

export default Controls;