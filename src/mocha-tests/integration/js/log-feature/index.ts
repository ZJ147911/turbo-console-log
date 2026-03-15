import { describe } from 'mocha';

import arrayTests from './array';
import classContextTests from './class';
import expressionTests from './expression';
import functionContextTests from './function';
import objectContextTests from './object';
import operatorsTests from './operators';
import variableTests from './variable';

export default (): void => {
  describe('Insert log message feature', () => {
    variableTests();
    classContextTests();
    functionContextTests();
    objectContextTests();
    operatorsTests();
    arrayTests();
    expressionTests();
  });
};
