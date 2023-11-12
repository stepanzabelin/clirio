import { Clirio, ClirioHelper } from '@clirio';
import sinon from 'sinon';
import { MigrationModule } from '../test-cli-app/modules/migration';
import { HelloModule } from '../test-cli-app/modules/hello';
import { CommonModule } from '../test-cli-app/modules/common';

const buildCli = () => {
  const cli = new Clirio();
  cli.setModules([CommonModule, HelloModule, MigrationModule]);
  return cli;
};

describe('Help mode cases', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  it('1.1', async () => {
    const entryStub = sandbox.stub(CommonModule.prototype, 'help');

    await buildCli().execute(Clirio.split('--help'));

    const [helper] = entryStub.getCall(0).args;

    const dump = helper.dumpAll();

    expect(ClirioHelper.formatDump(dump).replace(/\s+/g, ' ')).toEqual(
      `
-v, --version             
    
-h, --help                

-c, --check               Checking if the script is running
  --verbose, -v             
  --pool, -p                

hello there               Say hello there

hello venus|earth|mars    Say hello to the planet

hello                     Say hello in person using options
  --first-name, -f, --fname
                            First name
  --last-name, -l           Last name
  --verbose, -v             Verbose

hello-unknown             Say hello in person using options

hello to <first-name> <last-name>
                          Say hello in person using command
  <first-name>              
  <last-name>               

hello to-unknown <first-name> <last-name>
                          Say hello in person using command

hello guys <...all-names>
                          Say hello to guys
  <all-names>               

hello unknown-guys <...all-names>
                          Say hello to guys

hello people              Say hello to some people
  --name, -n                

hello people|aliens from <planet-name> to <...creature-names>
                          Say hello to whoever you want
  <planet-name>             
  <creature-names>          

hello planet-creatures <planet-name> <...creature-names>
                          Say hello to whoever you want
  <planet-name>             
  <creature-names>          

migration up <type-name> <type-id>  
  <type-id>                 
  --env, -e                 
  --silent, -s              
  --id, -i                  
  --start-date, -b          
  --end-date, -e            
  --algorithm, -a           

migration from <type-id> <type-name>  
  <type-id>                 
  <type-name>               
  --env, -e                 
  --silent, -s              
  --id, -i                  
  --start-date, -b          
  --end-date, -e            
  --algorithm, -a           

migration to <type-id> <type-name>  
  <type-id>                 
  <type-name>               
  --env, -e                 
  --silent, -s              
  -i, --id                  
  --start-date              
  --end-date                
  --algorithm, -a           

migration status <...db-tables>  
  <db-tables>               
  --id, -i                  
  -d, --from-date           
  -f, --format              
  --verbose                 

migration status-unknown <...db-tables>
`.replace(/\s+/g, ' '),
    );
  });
});
