import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCharacter } from '../api/characters';
import { useAuth } from '../contexts/AuthContext';

const CreateCharacterPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    race: 'human',
    class_: 'warrior',
    strength: 5,
    dexterity: 5,
    intelligence: 5
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Справочники для рас и классов с описаниями
  const races = {
    human: { name: 'Человек', description: 'Универсальная раса с хорошей адаптивностью', emoji: '👤' },
    elf: { name: 'Эльф', description: 'Грациозные существа с природной магией', emoji: '🧝' },
    dwarf: { name: 'Гном', description: 'Крепкие воины с сопротивлением к магии', emoji: '🧙' },
    orc: { name: 'Орк', description: 'Сильные и выносливые воины', emoji: '👹' }
  };

  const classes = {
    warrior: { name: 'Воин', description: 'Мастер ближнего боя и защиты', emoji: '⚔️' },
    mage: { name: 'Маг', description: 'Владеет мощной магией и заклинаниями', emoji: '🔮' },
    rogue: { name: 'Плут', description: 'Скрытный специалист по критическим ударам', emoji: '🗡️' },
    cleric: { name: 'Жрец', description: 'Целитель и защитник от нежити', emoji: '⚡' }
  };

  const maxPoints = 15;
  const usedPoints = formData.strength + formData.dexterity + formData.intelligence;
  const remainingPoints = maxPoints - usedPoints;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (stat: 'strength' | 'dexterity' | 'intelligence', value: number) => {
    const newValue = Math.max(1, Math.min(value, 10));
    const otherStats = usedPoints - formData[stat];
    
    if (otherStats + newValue <= maxPoints) {
      setFormData(prev => ({ ...prev, [stat]: newValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (usedPoints !== maxPoints) {
      setError(`Необходимо распределить все ${maxPoints} очков характеристик!`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      await createCharacter(formData, token);
      navigate('/');
    } catch (error) {
      console.error('Error creating character:', error);
      setError('Ошибка при создании персонажа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card card-large">
          <h2>🎭 Создание персонажа</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Имя персонажа */}
            <div className="form-group">
              <label className="form-label">Имя персонажа</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите имя вашего героя"
                required
                maxLength={30}
              />
            </div>

            {/* Выбор расы */}
            <div className="form-group">
              <label className="form-label">Раса</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                marginBottom: '10px'
              }}>
                {Object.entries(races).map(([key, race]) => (
                  <div
                    key={key}
                    onClick={() => handleInputChange('race', key)}
                    style={{
                      padding: '15px',
                      border: formData.race === key ? '2px solid #4facfe' : '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: formData.race === key ? 'rgba(79, 172, 254, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{race.emoji}</div>
                    <div style={{ fontWeight: 'bold', color: '#ffd700' }}>{race.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {race.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Выбор класса */}
            <div className="form-group">
              <label className="form-label">Класс</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                marginBottom: '10px'
              }}>
                {Object.entries(classes).map(([key, cls]) => (
                  <div
                    key={key}
                    onClick={() => handleInputChange('class_', key)}
                    style={{
                      padding: '15px',
                      border: formData.class_ === key ? '2px solid #56ab2f' : '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: formData.class_ === key ? 'rgba(86, 171, 47, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{cls.emoji}</div>
                    <div style={{ fontWeight: 'bold', color: '#ffd700' }}>{cls.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {cls.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Характеристики */}
            <div className="form-group">
              <label className="form-label">
                Характеристики 
                <span style={{ 
                  color: remainingPoints === 0 ? '#56ab2f' : '#ffd700',
                  marginLeft: '10px'
                }}>
                  (Осталось: {remainingPoints}/{maxPoints})
                </span>
              </label>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {[
                  { key: 'strength', name: 'Сила', emoji: '💪', description: 'Физическая мощь и урон' },
                  { key: 'dexterity', name: 'Ловкость', emoji: '🏃', description: 'Скорость и точность' },
                  { key: 'intelligence', name: 'Интеллект', emoji: '🧠', description: 'Магическая сила и знания' }
                ].map((stat) => (
                  <div key={stat.key} style={{
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '10px' 
                    }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{stat.emoji}</span>
                      <span style={{ fontWeight: 'bold', color: '#ffd700' }}>{stat.name}</span>
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginBottom: '15px'
                    }}>
                      {stat.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleStatChange(stat.key as any, formData[stat.key as keyof typeof formData] as number - 1)}
                        disabled={formData[stat.key as keyof typeof formData] <= 1}
                        style={{
                          background: formData[stat.key as keyof typeof formData] <= 1 ? '#666' : '#ff6b6b',
                          border: 'none',
                          borderRadius: '50%',
                          color: 'white',
                          width: '30px',
                          height: '30px',
                          cursor: formData[stat.key as keyof typeof formData] <= 1 ? 'not-allowed' : 'pointer',
                          fontSize: '1.2rem',
                          opacity: formData[stat.key as keyof typeof formData] <= 1 ? 0.6 : 1
                        }}
                      >
                        -
                      </button>
                      <span style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        minWidth: '30px', 
                        textAlign: 'center' 
                      }}>
                        {formData[stat.key as keyof typeof formData]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatChange(stat.key as any, formData[stat.key as keyof typeof formData] as number + 1)}
                        disabled={formData[stat.key as keyof typeof formData] >= 10 || remainingPoints <= 0}
                        style={{
                          background: (formData[stat.key as keyof typeof formData] >= 10 || remainingPoints <= 0) ? '#666' : '#56ab2f',
                          border: 'none',
                          borderRadius: '50%',
                          color: 'white',
                          width: '30px',
                          height: '30px',
                          cursor: (formData[stat.key as keyof typeof formData] >= 10 || remainingPoints <= 0) ? 'not-allowed' : 'pointer',
                          fontSize: '1.2rem',
                          opacity: (formData[stat.key as keyof typeof formData] >= 10 || remainingPoints <= 0) ? 0.6 : 1
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопки */}
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                ← Назад
              </button>
              
              <button
                type="submit"
                className={`btn btn-success btn-large ${isSubmitting || remainingPoints !== 0 ? 'btn-disabled' : ''}`}
                disabled={isSubmitting || remainingPoints !== 0}
              >
                {isSubmitting ? '⏳ Создание...' : 'Создать персонажа'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacterPage;