import { Clirio } from '@clirio';

describe('Args Clirio.parser', () => {
  it('Clirio.parse command', () => {
    expect(Clirio.parse('hey')).toEqual([
      {
        type: 'action',
        key: '0',
        value: 'hey',
      },
    ]);

    expect(Clirio.parse('--foo -b')).toEqual([
      { type: 'option', key: 'foo', value: null },
      { type: 'option', key: 'b', value: null },
    ]);

    expect(Clirio.parse('-a - b')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: '-', value: null },
      { type: 'action', key: '0', value: 'b' },
    ]);

    expect(Clirio.parse('-a -- b')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: '--', value: null },
      { type: 'action', key: '0', value: 'b' },
    ]);

    expect(Clirio.parse('-a -- b')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: '--', value: null },
      { type: 'action', key: '0', value: 'b' },
    ]);

    expect(Clirio.parse('-abc d')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: 'b', value: null },
      { type: 'option', key: 'c', value: 'd' },
    ]);

    expect(Clirio.parse('-abc d e')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: 'b', value: null },
      { type: 'option', key: 'c', value: 'd' },
      { type: 'action', key: '0', value: 'e' },
    ]);

    expect(Clirio.parse('-abc d -f')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: 'b', value: null },
      { type: 'option', key: 'c', value: 'd' },
      { type: 'option', key: 'f', value: null },
    ]);

    expect(Clirio.parse('-abc d --g')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: 'b', value: null },
      { type: 'option', key: 'c', value: 'd' },
      { type: 'option', key: 'g', value: null },
    ]);

    expect(Clirio.parse('-abc d --h')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: 'b', value: null },
      { type: 'option', key: 'c', value: 'd' },
      { type: 'option', key: 'h', value: null },
    ]);

    expect(Clirio.parse('-abc d --i=srt-srt')).toEqual([
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: 'b', value: null },
      { type: 'option', key: 'c', value: 'd' },
      { type: 'option', key: 'i', value: 'srt-srt' },
    ]);

    expect(Clirio.parse('--env=VAR=VAL --env2 VAR2=VAL2')).toEqual([
      { type: 'option', key: 'env', value: 'VAR=VAL' },
      { type: 'option', key: 'env2', value: 'VAR2=VAL2' },
    ]);

    expect(Clirio.parse('-h true --help=true -h2=false')).toEqual([
      { type: 'option', key: 'h', value: 'true' },
      { type: 'option', key: 'help', value: 'true' },
      { type: 'option', key: 'h', value: null },
      { type: 'option', key: '2', value: 'false' },
    ]);

    expect(Clirio.parse('write file 1.TXT')).toEqual([
      { type: 'action', key: '0', value: 'write' },
      { type: 'action', key: '1', value: 'file' },
      { type: 'action', key: '2', value: '1.TXT' },
    ]);

    expect(Clirio.parse('--foo -ba -dce 15')).toEqual([
      { type: 'option', key: 'foo', value: null },
      { type: 'option', key: 'b', value: null },
      { type: 'option', key: 'a', value: null },
      { type: 'option', key: 'd', value: null },
      { type: 'option', key: 'c', value: null },
      { type: 'option', key: 'e', value: '15' },
    ]);

    expect(Clirio.parse('-f-b-a 15')).toEqual([
      { type: 'option', key: 'f', value: null },
      { type: 'option', key: 'b', value: null },
      { type: 'option', key: 'a', value: '15' },
    ]);

    expect(Clirio.parse('--foo --ra 1 --t 2')).toEqual([
      { type: 'option', key: 'foo', value: null },
      { type: 'option', key: 'ra', value: '1' },
      { type: 'option', key: 't', value: '2' },
    ]);

    expect(Clirio.parse('--foo-bar --ra-t 1 --t-m 2')).toEqual([
      { type: 'option', key: 'foo-bar', value: null },
      { type: 'option', key: 'ra-t', value: '1' },
      { type: 'option', key: 't-m', value: '2' },
    ]);

    expect(Clirio.parse('animal "moo moo" cow')).toEqual([
      { type: 'action', key: '0', value: 'animal' },
      { type: 'action', key: '1', value: 'moo moo' },
      { type: 'action', key: '2', value: 'cow' },
    ]);

    expect(
      Clirio.parse('moo --honk cow -p 55 66 --tacos=good --verbose --count 5'),
    ).toEqual([
      { type: 'action', key: '0', value: 'moo' },
      { type: 'option', key: 'honk', value: 'cow' },
      { type: 'option', key: 'p', value: '55' },
      { type: 'action', key: '1', value: '66' },
      { type: 'option', key: 'tacos', value: 'good' },
      { type: 'option', key: 'verbose', value: null },
      { type: 'option', key: 'count', value: '5' },
    ]);

    // expect(
    //   Clirio.parse(
    //     '--honk "cow and cow" -p 55 --tacos="good not bad" --hotdog=big --verbose --count 5 -f "11"',
    //   ),
    // ).toEqual([
    //   { type: 'option', key: 'honk', value: 'cow and cow' },
    //   { type: 'option', key: 'p', value: '55' },
    //   { type: 'option', key: 'tacos', value: 'good not bad' },
    //   { type: 'option', key: 'verbose', value: null },
    //   { type: 'option', key: 'count', value: '5' },
    //   { type: 'option', key: 'f', value: '55' },
    // ]);
  });
});
