import { describe } from 'mocha';

import commentFeatureTests from './comment-feature';
import correctionFeatureTests from './correction-feature';
import deleteFeatureTests from './delete-feature';
import logFeatureTests from './log-feature';
import uncommentFeatureTests from './uncomment-feature';
export default (): void => {
  describe('JS features', () => {
    logFeatureTests();
    commentFeatureTests();
    uncommentFeatureTests();
    deleteFeatureTests();
    correctionFeatureTests();
  });
};
