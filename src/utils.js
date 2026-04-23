export const calculateModifier = (score) => {
  return Math.floor((Number(score) - 10) / 2) || 0;
};

export const calculateProficiencyBonus = (level) => {
  const lvl = Number(level) || 1;
  if(lvl < 5) return 2;
  if(lvl < 9) return 3;
  if(lvl < 13) return 4;
  if(lvl < 17) return 5;
  return 6;
};

export const SKILLS_LIST = [
  { key: 'acrobatics', label: 'Acrobacia', attr: 'dex' },
  { key: 'animalHandling', label: 'Adestrar Animais', attr: 'wis' },
  { key: 'arcana', label: 'Arcanismo', attr: 'int' },
  { key: 'athletics', label: 'Atletismo', attr: 'str' },
  { key: 'performance', label: 'Atuação', attr: 'cha' },
  { key: 'deception', label: 'Enganação', attr: 'cha' },
  { key: 'stealth', label: 'Furtividade', attr: 'dex' },
  { key: 'history', label: 'História', attr: 'int' },
  { key: 'intimidation', label: 'Intimidação', attr: 'cha' },
  { key: 'insight', label: 'Intuição', attr: 'wis' },
  { key: 'investigation', label: 'Investigação', attr: 'int' },
  { key: 'medicine', label: 'Medicina', attr: 'wis' },
  { key: 'nature', label: 'Natureza', attr: 'int' },
  { key: 'perception', label: 'Percepção', attr: 'wis' },
  { key: 'persuasion', label: 'Persuasão', attr: 'cha' },
  { key: 'sleightOfHand', label: 'Prestidigitação', attr: 'dex' },
  { key: 'religion', label: 'Religião', attr: 'int' },
  { key: 'survival', label: 'Sobrevivência', attr: 'wis' }
];

export const ATTRIBUTES_LIST = [
  { key: 'str', label: 'Força' },
  { key: 'dex', label: 'Destreza' },
  { key: 'con', label: 'Constituição' },
  { key: 'int', label: 'Inteligência' },
  { key: 'wis', label: 'Sabedoria' },
  { key: 'cha', label: 'Carisma' }
];
