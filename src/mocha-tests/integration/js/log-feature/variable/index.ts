import { describe } from 'mocha';

import deconstructionArgFunction from './deconstructionArgFunction';
import deconstructionVarAssignmentTest from './deconstructionVarAssignment';
import logLastLineTest from './logLastLine';
import primitiveVariableTest from './primitiveVariable';
import valueFromFunctionCall from './valueFromFunctionCall';

export default (): void => {
  describe('Variable context menu', () => {
    deconstructionVarAssignmentTest();
    primitiveVariableTest();
    logLastLineTest();
    deconstructionArgFunction();
    valueFromFunctionCall();
  });
};
