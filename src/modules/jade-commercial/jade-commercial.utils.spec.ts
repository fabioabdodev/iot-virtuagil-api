import { selectCrossSellModule } from './jade-commercial.utils';

describe('selectCrossSellModule', () => {
  it('prioritizes ambiental when client has no modules yet', () => {
    expect(selectCrossSellModule([])).toBe('ambiental');
  });

  it('suggests energia for clients already using ambiental', () => {
    expect(selectCrossSellModule(['ambiental'])).toBe('energia');
  });

  it('suggests ambiental for clients already using energia', () => {
    expect(selectCrossSellModule(['energia'])).toBe('ambiental');
  });

  it('returns null when client already has all supported modules', () => {
    expect(selectCrossSellModule(['ambiental', 'energia', 'acionamento'])).toBeNull();
  });
});
