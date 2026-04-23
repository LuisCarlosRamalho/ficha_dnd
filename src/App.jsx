import React, { useState, useEffect, useRef } from 'react';
import { calculateModifier, calculateProficiencyBonus, SKILLS_LIST, ATTRIBUTES_LIST } from './utils';
import './index.css';

const DEFAULT_CHARACTER = {
  theme: 'dark',
  name: '',
  classString: '',
  level: 1,
  background: '',
  playerName: '',
  race: '',
  alignment: '',
  xp: '',
  attributes: {
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
  },
  savesProficiencies: {
    str: false, dex: false, con: false, int: false, wis: false, cha: false
  },
  skillsProficiencies: {},
  armorClass: 10,
  initiativeBonus: 0,
  speed: 30,
  hpMax: 10,
  hpCurrent: 10,
  hpTemp: 0,
  hitDice: '1d10',
  deathSaves: { successes: [false,false,false], failures: [false,false,false] },
  personality: '',
  ideals: '',
  bonds: '',
  flaws: '',
  featuresTraits: '',
  attacksAndSpellcasting: '',
  equipment: '',
  coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  proficienciesAndLanguages: '',
  spells: {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
  },
  portrait: null,
};

function App() {
  const [char, setChar] = useState(() => {
    const saved = localStorage.getItem('dnd-character-sheet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.spells === 'string' || !parsed.spells) {
          parsed.spells = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
        }
        return { ...DEFAULT_CHARACTER, ...parsed };
      } catch (e) {
        return DEFAULT_CHARACTER;
      }
    }
    return DEFAULT_CHARACTER;
  });

  const addSpell = (level) => {
    setChar(prev => {
      const sp = { ...prev.spells };
      if (!sp[level]) sp[level] = [];
      sp[level] = [...sp[level], { name: '', desc: '', page: '' }];
      return { ...prev, spells: sp };
    });
  };

  const updateSpell = (level, index, field, value) => {
    setChar(prev => {
      const sp = { ...prev.spells };
      const newLevel = [...sp[level]];
      newLevel[index] = { ...newLevel[index], [field]: value };
      sp[level] = newLevel;
      return { ...prev, spells: sp };
    });
  };

  const removeSpell = (level, index) => {
    setChar(prev => {
      const sp = { ...prev.spells };
      sp[level] = sp[level].filter((_, i) => i !== index);
      return { ...prev, spells: sp };
    });
  };

  const [activeTab, setActiveTab] = useState('main');

  useEffect(() => {
    localStorage.setItem('dnd-character-sheet', JSON.stringify(char));
    document.documentElement.setAttribute('data-theme', char.theme);
  }, [char]);

  const updateField = (field, value) => {
    setChar(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (parent, field, value) => {
    setChar(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const pb = calculateProficiencyBonus(char.level);

  const modifiers = {
    str: calculateModifier(char.attributes.str),
    dex: calculateModifier(char.attributes.dex),
    con: calculateModifier(char.attributes.con),
    int: calculateModifier(char.attributes.int),
    wis: calculateModifier(char.attributes.wis),
    cha: calculateModifier(char.attributes.cha),
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePortraitUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateField('portrait', ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const formatSign = (num) => (num >= 0 ? `+${num}` : num);

  return (
    <div className="app-container">
      <div className="controls no-print">
        <button onClick={handlePrint}>🖨️ Imprimir / Salvar PDF</button>
        <select value={char.theme} onChange={e => updateField('theme', e.target.value)}>
          <option value="dark">Tema: Escuro (Dark)</option>
          <option value="parchment">Tema: Pergaminho Mágico</option>
          <option value="blue">Tema: Azul Safira</option>
          <option value="green">Tema: Verde Floresta</option>
          <option value="light">Tema: Claro Clássico</option>
        </select>
        <button onClick={() => { if(window.confirm('Limpar toda a ficha?')) setChar(DEFAULT_CHARACTER); }}>🗑️ Resetar Ficha</button>
      </div>

      {/* HEADER SECTION */}
      <div className="panel header-grid">
        <label className="portrait-container">
          {char.portrait ? (
            <img src={char.portrait} alt="Portrait" className="portrait-img" />
          ) : (
            <span>Clique para inserir imagem (.png)</span>
          )}
          <input type="file" accept="image/png, image/jpeg" style={{display:'none'}} onChange={handlePortraitUpload} />
        </label>

        <div>
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{fontSize: '1.2rem', color: 'var(--primary-color)'}}>Nome do Personagem</label>
            <input type="text" value={char.name} onChange={e => updateField('name', e.target.value)} style={{fontSize: '2rem', padding: '10px'}} />
          </div>

          <div className="header-details-grid">
            <div className="input-group">
              <label>Classe</label>
              <input type="text" value={char.classString} onChange={e => updateField('classString', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Nível</label>
              <input type="number" min="1" max="20" value={char.level} onChange={e => updateField('level', parseInt(e.target.value)||1)} />
            </div>
            <div className="input-group">
              <label>Antecedente</label>
              <input type="text" value={char.background} onChange={e => updateField('background', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Nome do Jogador</label>
              <input type="text" value={char.playerName} onChange={e => updateField('playerName', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Raça</label>
              <input type="text" value={char.race} onChange={e => updateField('race', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Tendência</label>
              <input type="text" value={char.alignment} onChange={e => updateField('alignment', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs no-print">
        <div className={`tab ${activeTab === 'main' ? 'active' : ''}`} onClick={() => setActiveTab('main')}>Ficha Principal</div>
        <div className={`tab ${activeTab === 'combat' ? 'active' : ''}`} onClick={() => setActiveTab('combat')}>Combate</div>
        <div className={`tab ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>Equipamento & Itens</div>
        <div className={`tab ${activeTab === 'spells' ? 'active' : ''}`} onClick={() => setActiveTab('spells')}>Magias</div>
      </div>

      <div className="main-grid">
        {/* ATTRIBUTES COL */}
        <div className="attributes-col">
          <div className="panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div className="stat-label">Bônus Profic.</div>
            <div className="stat-value" style={{marginBottom: '20px', border: 'none'}}>{formatSign(pb)}</div>

            {ATTRIBUTES_LIST.map(attr => (
              <div key={attr.key} className="attribute-box">
                <span className="attribute-name">{attr.label}</span>
                <input 
                  type="number" 
                  className="attribute-value"
                  value={char.attributes[attr.key]}
                  onChange={e => updateNested('attributes', attr.key, parseInt(e.target.value)||0)}
                />
                <span className="attribute-mod">{formatSign(modifiers[attr.key])}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN PANEL BASED ON TAB */}
        <div style={{ display: activeTab === 'main' ? 'block' : 'none' }} className="tab-content active">
          {/* Main Info */}
          <div className="panel">
            <div className="panel-header">Testes de Resistência</div>
            {ATTRIBUTES_LIST.map(attr => {
              const isProf = char.savesProficiencies[attr.key];
              const val = modifiers[attr.key] + (isProf ? pb : 0);
              return (
                <div key={`save-${attr.key}`} className="skill-item">
                  <input type="checkbox" checked={isProf} onChange={e => updateNested('savesProficiencies', attr.key, e.target.checked)} />
                  <span className="skill-mod">{formatSign(val)}</span>
                  <span className="skill-name">{attr.label}</span>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <div className="panel-header">Perícias</div>
            {SKILLS_LIST.map(skill => {
              const isProf = char.skillsProficiencies[skill.key];
              const val = modifiers[skill.attr] + (isProf ? pb : 0);
              return (
                <div key={skill.key} className="skill-item">
                  <input type="checkbox" checked={isProf} onChange={e => updateNested('skillsProficiencies', skill.key, e.target.checked)} />
                  <span className="skill-mod">{formatSign(val)}</span>
                  <span className="skill-name">{skill.label}</span>
                  <span className="skill-attr">({ATTRIBUTES_LIST.find(a=>a.key===skill.attr).label.substring(0,3)})</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Other Sections always visible or conditionally layout */}
        <div style={{ display: activeTab === 'main' ? 'block' : 'none' }}>
            <div className="panel">
              <div className="panel-header">Características de Personalidade</div>
              <div className="input-group text-area-box">
                <label>Traços de Personalidade</label>
                <textarea value={char.personality} onChange={e => updateField('personality', e.target.value)} />
              </div>
              <div className="input-group text-area-box">
                <label>Ideais</label>
                <textarea value={char.ideals} onChange={e => updateField('ideals', e.target.value)} />
              </div>
              <div className="input-group text-area-box">
                <label>Ligações</label>
                <textarea value={char.bonds} onChange={e => updateField('bonds', e.target.value)} />
              </div>
              <div className="input-group text-area-box">
                <label>Defeitos</label>
                <textarea value={char.flaws} onChange={e => updateField('flaws', e.target.value)} />
              </div>
            </div>
            
            <div className="panel">
              <div className="panel-header">Proficiências e Idiomas</div>
              <div className="input-group text-area-box">
                <textarea style={{minHeight:'200px'}} value={char.proficienciesAndLanguages} onChange={e => updateField('proficienciesAndLanguages', e.target.value)} />
              </div>
            </div>
        </div>

        {/* COMBAT TAB */}
        <div style={{ display: activeTab === 'combat' ? 'block' : 'none', gridColumn: 'span 2' }}>
           <div className="stats-row">
            <div className="stat-box shield">
              <input type="number" className="stat-value" value={char.armorClass} onChange={e=>updateField('armorClass', e.target.value)} />
              <div className="stat-label">Classe Arm.</div>
            </div>
            <div className="stat-box">
              <input type="number" className="stat-value" value={char.initiativeBonus} onChange={e=>updateField('initiativeBonus', e.target.value)} />
              <div className="stat-label">Iniciativa (Extra)</div>
              <small>Total: {formatSign(modifiers.dex + Number(char.initiativeBonus||0))}</small>
            </div>
            <div className="stat-box">
              <input type="number" className="stat-value" value={char.speed} onChange={e=>updateField('speed', e.target.value)} />
              <div className="stat-label">Desloc.</div>
            </div>
          </div>

          <div className="panel">
             <div className="panel-header">Pontos de Vida</div>
             <div style={{display:'flex', gap:'20px'}}>
               <div className="input-group" style={{flex:1}}>
                 <label>Máximo</label>
                 <input type="number" value={char.hpMax} onChange={e=>updateField('hpMax', e.target.value)} />
               </div>
               <div className="input-group" style={{flex:1}}>
                 <label>Atual</label>
                 <input type="number" value={char.hpCurrent} onChange={e=>updateField('hpCurrent', e.target.value)} />
               </div>
               <div className="input-group" style={{flex:1}}>
                 <label>Temporário</label>
                 <input type="number" value={char.hpTemp} onChange={e=>updateField('hpTemp', e.target.value)} />
               </div>
             </div>
             
             <div style={{display:'flex', gap:'20px', marginTop: '10px'}}>
                <div className="input-group" style={{flex:1}}>
                    <label>Dados de Vida</label>
                    <input type="text" value={char.hitDice} onChange={e=>updateField('hitDice', e.target.value)} placeholder="Ex: 1d10" />
                </div>
                <div className="input-group" style={{flex:1}}>
                    <label>Sucessos na Morte (Checkmarks no papel)</label>
                    <div>🟩 🟩 🟩</div>
                    <label>Falhas na Morte</label>
                    <div>🟥 🟥 🟥</div>
                </div>
             </div>
          </div>

          <div className="panel">
             <div className="panel-header">Ataques e Magias</div>
             <div className="input-group text-area-box">
                <textarea style={{minHeight:'300px'}} value={char.attacksAndSpellcasting} onChange={e=>updateField('attacksAndSpellcasting', e.target.value)} placeholder="Arma | Bônus Atq | Dano/Tipo..." />
             </div>
          </div>
          
          <div className="panel">
             <div className="panel-header">Características e Habilidades (Classe)</div>
             <div className="input-group text-area-box">
                <textarea style={{minHeight:'300px'}} value={char.featuresTraits} onChange={e=>updateField('featuresTraits', e.target.value)} />
             </div>
          </div>
        </div>

        {/* EQUIPMENT TAB */}
        <div style={{ display: activeTab === 'equipment' ? 'block' : 'none', gridColumn: 'span 2' }}>
           <div className="panel" style={{display:'flex', gap: '15px'}}>
              {['cp','sp','ep','gp','pp'].map(coin => (
                <div className="input-group" key={coin} style={{flex: 1}}>
                  <label>{coin.toUpperCase()}</label>
                  <input type="number" value={char.coins[coin]} onChange={e => updateNested('coins', coin, parseInt(e.target.value)||0)} />
                </div>
              ))}
           </div>
           <div className="panel">
             <div className="panel-header">Equipamento</div>
             <div className="input-group text-area-box">
                <textarea style={{minHeight:'400px'}} value={char.equipment} onChange={e=>updateField('equipment', e.target.value)} />
             </div>
           </div>
        </div>

        {/* SPELLS TAB */}
        <div style={{ display: activeTab === 'spells' ? 'block' : 'none', gridColumn: 'span 2' }}>
           <div className="panel">
             <div className="panel-header">Grimório / Magias Conhecidas</div>
             <div className="spells-grid">
               {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                 <div key={`spell-lvl-${level}`} className="spell-circle-box">
                   <div className="spell-circle-header">
                     <h3>{level === 0 ? 'Truques (0)' : `Círculo ${level}`}</h3>
                     <button onClick={() => addSpell(level)} className="btn-add-spell no-print">+ Adicionar</button>
                   </div>
                   <div className="spell-items">
                     {(char.spells[level] || []).map((sp, idx) => (
                       <div key={`sp-${level}-${idx}`} className="spell-item-row">
                         <div className="spell-item-top">
                           <input 
                             type="text" 
                             placeholder="Nome da magia" 
                             value={sp.name} 
                             onChange={e => updateSpell(level, idx, 'name', e.target.value)} 
                             className="spell-input-name"
                           />
                           <input 
                             type="text" 
                             placeholder="Pág" 
                             value={sp.page} 
                             onChange={e => updateSpell(level, idx, 'page', e.target.value)} 
                             className="spell-input-page"
                           />
                           <button onClick={() => removeSpell(level, idx)} className="btn-remove-spell no-print">X</button>
                         </div>
                         <textarea 
                           placeholder="Descrição / Efeitos" 
                           value={sp.desc} 
                           onChange={e => updateSpell(level, idx, 'desc', e.target.value)}
                           className="spell-input-desc"
                           rows="2"
                         />
                       </div>
                     ))}
                     {(char.spells[level] || []).length === 0 && <p style={{opacity: 0.5, fontSize: '0.8rem'}}>Nenhuma magia neste círculo</p>}
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

export default App;
