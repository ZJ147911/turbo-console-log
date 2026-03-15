import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import { namedFunctionAssignmentChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/namedFunctionAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

import failingCases from './failingCases';
import passingCases from './passingCases';

describe('namedFunctionAssignmentChecker', () => {
  for (const test of passingCases) {
    it(`should detect named function assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(
        doc.getText(),
        test.fileExtension,
        test.selectionLine,
      );
      const result = namedFunctionAssignmentChecker(
        ast,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const test of failingCases) {
    it(`should not detect named function assignment – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const ast = parseCode(
        doc.getText(),
        test.fileExtension,
        test.selectionLine,
      );
      const result = namedFunctionAssignmentChecker(
        ast,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
