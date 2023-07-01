import { Clirio } from '../index';

describe('Args Clirio.parser', () => {
  it('Clirio.parse command', () => {
    expect(Clirio.parse('hey')).toEqual([
      {
        type: 'ACTION',
        key: '0',
        value: 'hey',
      },
    ]);

    expect(Clirio.parse('--foo -b')).toEqual([
      { type: 'OPTION', key: 'foo', value: null },
      { type: 'OPTION', key: 'b', value: null },
    ]);

    expect(
      Clirio.parse('moo --honk cow -p 55 66 --tacos=good --verbose --count 5')
    ).toEqual([
      { type: 'ACTION', key: '0', value: 'moo' },
      { type: 'OPTION', key: 'honk', value: 'cow' },
      { type: 'OPTION', key: 'p', value: '55' },
      { type: 'ACTION', key: '1', value: '66' },
      { type: 'OPTION', key: 'tacos', value: 'good' },
      { type: 'OPTION', key: 'verbose', value: null },
      { type: 'OPTION', key: 'count', value: '5' },
    ]);

    expect(Clirio.parse('-a - b')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: '-', value: null },
      { type: 'ACTION', key: '0', value: 'b' },
    ]);

    expect(Clirio.parse('-a -- b')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: '--', value: null },
      { type: 'ACTION', key: '0', value: 'b' },
    ]);

    expect(Clirio.parse('-a -- b')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: '--', value: null },
      { type: 'ACTION', key: '0', value: 'b' },
    ]);

    expect(Clirio.parse('-abc d')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: 'b', value: null },
      { type: 'OPTION', key: 'c', value: 'd' },
    ]);

    expect(Clirio.parse('-abc d e')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: 'b', value: null },
      { type: 'OPTION', key: 'c', value: 'd' },
      { type: 'ACTION', key: '0', value: 'e' },
    ]);

    expect(Clirio.parse('-abc d -f')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: 'b', value: null },
      { type: 'OPTION', key: 'c', value: 'd' },
      { type: 'OPTION', key: 'f', value: null },
    ]);

    expect(Clirio.parse('-abc d --g')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: 'b', value: null },
      { type: 'OPTION', key: 'c', value: 'd' },
      { type: 'OPTION', key: 'g', value: null },
    ]);

    expect(Clirio.parse('-abc d --h')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: 'b', value: null },
      { type: 'OPTION', key: 'c', value: 'd' },
      { type: 'OPTION', key: 'h', value: null },
    ]);

    expect(Clirio.parse('-abc d --i=srt-srt')).toEqual([
      { type: 'OPTION', key: 'a', value: null },
      { type: 'OPTION', key: 'b', value: null },
      { type: 'OPTION', key: 'c', value: 'd' },
      { type: 'OPTION', key: 'i', value: 'srt-srt' },
    ]);

    expect(Clirio.parse('--env=VAR=VAL --env2 VAR2=VAL2')).toEqual([
      { type: 'OPTION', key: 'env', value: 'VAR=VAL' },
      { type: 'OPTION', key: 'env2', value: 'VAR2=VAL2' },
    ]);

    expect(Clirio.parse('-h true --help=true -h2=false')).toEqual([
      { type: 'OPTION', key: 'h', value: 'true' },
      { type: 'OPTION', key: 'help', value: 'true' },
      { type: 'OPTION', key: 'h', value: null },
      { type: 'OPTION', key: '2', value: 'false' },
    ]);

    expect(Clirio.parse('write file 1.TXT')).toEqual([
      { type: 'ACTION', key: '0', value: 'write' },
      { type: 'ACTION', key: '1', value: 'file' },
      { type: 'ACTION', key: '2', value: '1.TXT' },
    ]);
  });
});
