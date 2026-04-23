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
  equipment: [],
  coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  gems: [],
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
        if (typeof parsed.equipment === 'string') {
          parsed.equipment = parsed.equipment.trim() ? [{ name: parsed.equipment, weight: '', desc: '', type: '', value: '' }] : [];
        }
        if (!parsed.equipment) parsed.equipment = [];
        if (!parsed.gems) parsed.gems = [];
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

  const addEquipment = () => {
    setChar(prev => ({
      ...prev,
      equipment: [...prev.equipment, { name: '', weight: '', desc: '', type: '', value: '' }]
    }));
  };

  const updateEquipment = (index, field, value) => {
    setChar(prev => {
      const newEq = [...prev.equipment];
      newEq[index] = { ...newEq[index], [field]: value };
      return { ...prev, equipment: newEq };
    });
  };

  const removeEquipment = (index) => {
    setChar(prev => {
      return { ...prev, equipment: prev.equipment.filter((_, i) => i !== index) };
    });
  };

  const addGem = () => {
    setChar(prev => ({
      ...prev,
      gems: [...prev.gems, { type: '', weight: '', size: '', value: '' }]
    }));
  };

  const updateGem = (index, field, value) => {
    setChar(prev => {
      const newGems = [...prev.gems];
      newGems[index] = { ...newGems[index], [field]: value };
      return { ...prev, gems: newGems };
    });
  };

  const removeGem = (index) => {
    setChar(prev => {
      return { ...prev, gems: prev.gems.filter((_, i) => i !== index) };
    });
  };

  const updateDeathSave = (type, index, value) => {
    setChar(prev => {
      const arr = [...prev.deathSaves[type]];
      arr[index] = value;
      return { ...prev, deathSaves: { ...prev.deathSaves, [type]: arr } };
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

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%'}}>
              {ATTRIBUTES_LIST.map(attr => (
                <div key={attr.key} className="attribute-box" style={{marginBottom: 0, padding: '5px'}}>
                  <span className="attribute-name" style={{fontSize: '0.65rem'}}>{attr.label}</span>
                  <input 
                    type="number" 
                    className="attribute-value"
                    value={char.attributes[attr.key]}
                    onChange={e => updateNested('attributes', attr.key, parseInt(e.target.value)||0)}
                    style={{width: '40px', height: '40px', fontSize: '1.2rem'}}
                  />
                  <span className="attribute-mod" style={{fontSize: '1rem', padding: '2px 10px'}}>{formatSign(modifiers[attr.key])}</span>
                </div>
              ))}
            </div>
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
                    <label>Sucessos na Morte</label>
                    <div style={{display:'flex', gap:'8px', marginBottom:'10px'}}>
                      {[0,1,2].map(i => <input type="checkbox" key={`succ-${i}`} checked={char.deathSaves.successes[i]} onChange={e => updateDeathSave('successes', i, e.target.checked)} style={{transform: 'scale(1.5)'}} />)}
                    </div>
                    <label>Falhas na Morte</label>
                    <div style={{display:'flex', gap:'8px'}}>
                      {[0,1,2].map(i => <input type="checkbox" key={`fail-${i}`} checked={char.deathSaves.failures[i]} onChange={e => updateDeathSave('failures', i, e.target.checked)} style={{transform: 'scale(1.5)'}} />)}
                    </div>
                </div>
             </div>
          </div>

          <div className="panel">
             <div className="panel-header">Ataques (Armas Equipadas)</div>
             <div className="equipment-list">
                 {char.equipment.filter(eq => eq.type && eq.type.toLowerCase().includes('arma')).map((arma, idx) => (
                    <div key={`atk-${idx}`} className="equipment-row" style={{borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px'}}>
                       <strong style={{flex: 2}}>{arma.name || 'Arma sem nome'}</strong>
                       <span style={{flex: 3, fontSize: '0.9rem'}}>{arma.desc}</span>
                    </div>
                 ))}
                 {char.equipment.filter(eq => eq.type && eq.type.toLowerCase().includes('arma')).length === 0 && (
                    <p style={{opacity: 0.5, fontSize: '0.85rem'}}>Escreva "arma" no Tipo de um item na aba Equipamentos para listar aqui.</p>
                 )}
                 <textarea style={{minHeight:'100px', width: '100%', marginTop: '10px'}} value={char.attacksAndSpellcasting} onChange={e=>updateField('attacksAndSpellcasting', e.target.value)} placeholder="Ataques extras ou anotações de combate..." className="spell-input-desc" />
             </div>
          </div>
          
          <div className="panel">
             <div className="panel-header">Magias (Resumo Rápido)</div>
             <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
               {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                 const spells = char.spells[level] || [];
                 if (spells.length === 0) return null;
                 return (
                   <div key={`combat-spells-${level}`} style={{marginBottom: '10px'}}>
                     <h4 style={{borderBottom: '1px solid #ccc', paddingBottom: '2px', marginBottom: '5px'}}>
                        {level === 0 ? 'Truques (Cantrips)' : `Círculo ${level}`}
                     </h4>
                     <ul style={{listStyleType: 'square', marginLeft: '20px', fontSize: '0.9rem'}}>
                       {spells.map((sp, i) => (
                          <li key={`spl-${i}`} style={{marginBottom: '3px'}}>
                            <strong>{sp.name || 'Magia sem nome'}</strong> {sp.page ? `(pág ${sp.page})` : ''} 
                            {sp.desc ? ` - ${sp.desc}` : ''}
                          </li>
                       ))}
                     </ul>
                   </div>
                 );
               })}
               {Object.values(char.spells).every(arr => arr.length === 0) && (
                 <p style={{opacity: 0.5, fontSize: '0.85rem'}}>Nenhuma magia cadastrada na aba Magias.</p>
               )}
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
           <div className="panel">
              <div className="panel-header">Moedas</div>
              <div style={{display:'flex', gap: '15px'}}>
                {[{k: 'cp', label: 'Bronze'}, {k: 'sp', label: 'Prata'}, {k: 'gp', label: 'Ouro'}, {k: 'pp', label: 'Platina'}].map(coin => (
                  <div className="input-group" key={coin.k} style={{flex: 1}}>
                    <label>{coin.label}</label>
                    <input type="number" value={char.coins[coin.k]} onChange={e => updateNested('coins', coin.k, parseInt(e.target.value)||0)} />
                  </div>
                ))}
              </div>
           </div>
           <div className="panel">
             <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', padding: '5px 15px'}}>
                 <span>Equipamento</span>
                 <button onClick={addEquipment} className="btn-add-spell no-print">+ Adicionar Item</button>
             </div>
             <div className="equipment-list">
                 {char.equipment.length > 0 && (
                   <div className="equipment-row equipment-header">
                       <span style={{flex: 2}}>Nome</span>
                       <span style={{flex: 1}}>Tipo</span>
                       <span style={{flex: 3}}>Descrição</span>
                       <span style={{flex: 1}}>Peso</span>
                       <span style={{flex: 1}}>Valor</span>
                       <span style={{width: '30px'}}></span>
                   </div>
                 )}
                 {char.equipment.map((item, idx) => (
                   <div key={`eq-${idx}`} className="equipment-row">
                     <input type="text" placeholder="Espada Longa..." style={{flex: 2}} value={item.name} onChange={e => updateEquipment(idx, 'name', e.target.value)} />
                     <input type="text" placeholder="Arma Marcial" style={{flex: 1}} value={item.type} onChange={e => updateEquipment(idx, 'type', e.target.value)} />
                     <input type="text" placeholder="1d8 cortante" style={{flex: 3}} value={item.desc} onChange={e => updateEquipment(idx, 'desc', e.target.value)} />
                     <input type="text" placeholder="1.5 kg" style={{flex: 1}} value={item.weight} onChange={e => updateEquipment(idx, 'weight', e.target.value)} />
                     <input type="text" placeholder="15 po" style={{flex: 1}} value={item.value} onChange={e => updateEquipment(idx, 'value', e.target.value)} />
                     <button onClick={() => removeEquipment(idx)} className="btn-remove-spell no-print" style={{width: '30px'}}>X</button>
                   </div>
                 ))}
                 {char.equipment.length === 0 && <p style={{opacity: 0.5, fontSize: '0.9rem', textAlign: 'center'}}>Nenhum equipamento adicionado ainda.</p>}
             </div>
           </div>

           <div className="panel">
             <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', padding: '5px 15px'}}>
                 <span>Joias</span>
                 <button onClick={addGem} className="btn-add-spell no-print">+ Adicionar Joia</button>
             </div>
             <div className="equipment-list">
                 {char.gems.length > 0 && (
                   <div className="equipment-row equipment-header">
                       <span style={{flex: 2}}>Tipo</span>
                       <span style={{flex: 1}}>Tamanho</span>
                       <span style={{flex: 1}}>Peso</span>
                       <span style={{flex: 1}}>Valor</span>
                       <span style={{width: '30px'}}></span>
                   </div>
                 )}
                 {char.gems.map((item, idx) => (
                   <div key={`gem-${idx}`} className="equipment-row">
                     <input type="text" placeholder="Diamante" style={{flex: 2}} value={item.type} onChange={e => updateGem(idx, 'type', e.target.value)} />
                     <input type="text" placeholder="Pequeno" style={{flex: 1}} value={item.size} onChange={e => updateGem(idx, 'size', e.target.value)} />
                     <input type="text" placeholder="0.1 kg" style={{flex: 1}} value={item.weight} onChange={e => updateGem(idx, 'weight', e.target.value)} />
                     <input type="text" placeholder="50 po" style={{flex: 1}} value={item.value} onChange={e => updateGem(idx, 'value', e.target.value)} />
                     <button onClick={() => removeGem(idx)} className="btn-remove-spell no-print" style={{width: '30px'}}>X</button>
                   </div>
                 ))}
                 {char.gems.length === 0 && <p style={{opacity: 0.5, fontSize: '0.9rem', textAlign: 'center'}}>Nenhuma joia adicionada.</p>}
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
