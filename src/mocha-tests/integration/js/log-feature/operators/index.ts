import { describe } from 'mocha';

import nullishTests from './nullish';
import ternaryTests from './ternary';
export default (): void => {
  describe('Special Operators', () => {
    ternaryTests();
    nullishTests();
  });
};
