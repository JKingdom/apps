// Copyright 2017-2018 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import BN from 'bn.js';
import { TranslationFunction } from 'i18next';

import isString from '@polkadot/util/is/string';

import { maxValue } from '../util/chainSpec';
import { BIT_LENGTH_128 } from '../constants';
import { IsValidWithMessage } from './types';
import scientificNotationToNumber from './scientificNotationToNumber';

// RegEx Pattern (positive int or scientific notation): http://regexlib.com/REDetails.aspx?regexp_id=330
const reValidInputChars = RegExp('^[0-9\e\+\.]+[0-9\e\+\.]*$');

export default function isValidBalance (input: any, t: TranslationFunction, bitLength?: number): IsValidWithMessage {
  bitLength = bitLength || BIT_LENGTH_128;

  let errorMessageKey: string = '';
  let errorMessageUntranslated: string = '';

  let warnMessageKey: string = '';
  let warnMessageUntranslated: string = '';

  // always a string from <input type='number'> but leave as failsafe
  if (!isString(input)) {
    throw Error(t('balance.error.string.required', {
      defaultValue: 'Balance input value must be valid type'
    }));
  }

  // impossible since using <input type='number'> and prevents spaces but leave as failsafe
  input = input.toLowerCase().split(' ').join('');

  // match 'e' when first input index (i.e 'e2')
  if (input === 'e') {
    errorMessageKey = 'balance.error.format';
    errorMessageUntranslated = 'Balance to transfer in DOTs must be a number or expressed in scientific notation (i.e. 3.4e38) or exponential with \'e+\'';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated
      }),
      errorMessageUntranslated
    };
  }

  const matchE = input.match(/e/gi);
  const matchPlus = input.match(/\+/gi);
  const matchEPlus = input.match(/e\+/gi);

  const matchEBeforeNumberOrPlus = input.match(/(e)(?=[0-9+])/ig);
  const matchEPlusBeforeNumber = input.match(/(e\+)(?=[0-9])/ig);

  // match 'e' when not first input index (i.e. '1e2') since input starting with 'e' matched in earlier condition
  if (matchE && matchE.length > 1 || matchPlus && matchPlus.length > 1) {
    errorMessageKey = 'balance.error.notation.scientific.duplicate';
    errorMessageUntranslated = 'Scientific notation may only contain one instance of \'e\' for scientific notation or exponential with \'e+\'';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated
      }),
      errorMessageUntranslated
    };
  }

  if (matchEPlus && matchEPlus.length === 1 && !matchEPlusBeforeNumber) {
    errorMessageKey = 'balance.error.notation.exponential.exponent.missing';
    errorMessageUntranslated = 'Exponential \'e+\' notation when used must be followed by a number';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated
      }),
      errorMessageUntranslated
    };
  }

  if (matchE && matchE.length === 1 && !matchEBeforeNumberOrPlus) {
    errorMessageKey = 'balance.error.notation.scientific.exponent.missing';
    errorMessageUntranslated = 'Scientific notation \'e\' when used must be followed by a number';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated
      }),
      errorMessageUntranslated
    };
  }

  // check the string only contains integers digits or scientific notation
  if (!reValidInputChars.test(input)) {
    errorMessageKey = 'balance.error.format';
    errorMessageUntranslated = 'Balance to transfer in DOTs must be a number or expressed in scientific notation (i.e. 3.4e38) or exponential with \'e+\'';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated
      }),
      errorMessageUntranslated
    };
  }

  // check value is not decimal and greater than or equal to one, whether it be scientific notation, exponential (which allow decimal)
  if (Number(parseFloat(input)) < 1 && Number(parseFloat(input)) !== 0) {
    errorMessageKey = 'balance.error.decimal';
    errorMessageUntranslated = 'Decimal points are only allowed in scientific notation by using an \'e\' (i.e. 3.4e38) or exponential with \'e+\'';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated
      }),
      errorMessageUntranslated
    };
  }

  // check value is zero
  if (Number(parseFloat(input)) === 0) {
    warnMessageKey = 'balance.warn.zero';
    warnMessageUntranslated = 'Balance to transfer in DOTs should be greater than or equal to one';

    return {
      isValid: true,
      warnMessage: t(warnMessageKey, {
        defaultValue: warnMessageUntranslated
      }),
      warnMessageUntranslated
    };
  }

  // check value is not finite (infinite)
  if (!isFinite(parseFloat(input))) {
    errorMessageKey = 'balance.error.infinite';
    errorMessageUntranslated = 'Balance to transfer in DOTs must not be infinite';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated
      }),
      errorMessageUntranslated
    };
  }

  // if there is a full stop '.' (only allowed for scientific notation) but they have not yet entered an 'e', then generate error until 'e' provided
  if (input.indexOf('.') !== -1 && input.indexOf('e') === -1) {
    errorMessageKey = 'balance.error.decimals.restricted';
    errorMessageUntranslated = 'Decimal points are only allowed in scientific notation by using an \'e\' (i.e. 3.4e38) or exponential with \'e+\'';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated
      }),
      errorMessageUntranslated
    };
  }

  const maxBN = maxValue(bitLength);
  const inputBN = new BN(input);

  // if 128 bit then max is 340282366920938463463374607431768211455
  if (!inputBN.lt(maxBN)) {
    errorMessageKey = 'balance.error.above.max';
    errorMessageUntranslated = 'Balance above max for {{bitLength}} bit';

    return {
      isValid: false,
      errorMessage: t(errorMessageKey, {
        defaultValue: errorMessageUntranslated,
        replace: {
          bitLength: bitLength
        }
      }),
      errorMessageUntranslated
    };
  }

  if (input.indexOf('e') !== -1) {
    let { num, errorMessage, errorMessageUntranslated } = scientificNotationToNumber(input, t);

    if (!num) {
      return {
        isValid: false,
        errorMessage,
        errorMessageUntranslated
      };
    }

    const numBN = new BN(num);

    if (matchEPlus && !numBN.lt(maxBN)) {
      errorMessageKey = 'balance.error.notation.exponential.above.max';
      errorMessageUntranslated = 'Balance value after converting from exponential notation is above max for {{bitLength}} bit';

      return {
        isValid: false,
        errorMessage: t(errorMessageKey, {
          defaultValue: errorMessageUntranslated,
          replace: {
            bitLength: bitLength
          }
        }),
        errorMessageUntranslated
      };
    } else if (!numBN.lt(maxBN)) {
      errorMessageKey = 'balance.error.notation.scientific.above.max';
      errorMessageUntranslated = 'Balance value after converting from scientific notation is above max for {{bitLength}} bit';

      return {
        isValid: false,
        errorMessage: t(errorMessageKey, {
          defaultValue: errorMessageUntranslated,
          replace: {
            bitLength: bitLength
          }
        }),
        errorMessageUntranslated
      };
    } else {
      return {
        isValid: true,
        infoMessage: num,
        num
      };
    }
  }

  return {
    isValid: true,
    infoMessage: Number.parseFloat(input).toExponential(2)
  };
}
