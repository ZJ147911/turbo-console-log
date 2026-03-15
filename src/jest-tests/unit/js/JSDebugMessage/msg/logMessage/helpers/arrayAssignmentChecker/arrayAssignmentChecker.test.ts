import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import { arrayAssignmentChecker } from '@/debug-message/js/JSDebugMessage/msg/logMessage/helpers/arrayAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

import failingCases from './failingCases';
import passingCases from './passingCases';

describe('arrayAssignmentChecker', () => {
  for (const doc of passingCases) {
    it(`should detect array assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        doc.fileExtension,
        doc.selectionLine,
      );
      const result = arrayAssignmentChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should not detect array assignment – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const ast = parseCode(
        document.getText(),
        doc.fileExtension,
        doc.selectionLine,
      );
      const result = arrayAssignmentChecker(
        ast,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result.isChecked).toBe(false);
    });
  }
});
