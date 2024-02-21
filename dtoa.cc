#include "dtoa.h"
#include <stdint.h>
#include <math.h>
#include <string.h>
#include <unistd.h>

uint64_t toU64(double d) {
  return *(uint64_t*)&d;
}
double toF64(uint64_t u) {
  return *(double*)&u;
}

char* dtoa(double d) {
  bool neg = signbit(d);
  if (neg)
    d = -d;
  double d1 = toF64(toU64(d) - 1);
  double d2 = toF64(toU64(d) + 1);
  char* result = new char;
  size_t resultLen = 0;
  result[0] = '\0';
  if (d == 0.0) {
    if (neg) {
      result = (char*)realloc(result, 3);
      memcpy(result, "-0", 2);
      result[2] = '\0';
      return result;
    }
    result = (char*)realloc(result, 2);
    result[resultLen++] = '0';
    result[resultLen] = '\0';
    return result;
  }
  if (!isfinite(d)) {
    if (isnan(d)) {
      result = (char*)realloc(result, 4);
      memcpy(result, "NaN", 3);
      result[3] = '\0';
      if (neg) {
        result = (char*)realloc(result, 5);
        memmove(result + 1, result, 3);
        result[0] = '-';
        result[4] = '\0';
      }
      return result;
    }
    result = (char*)realloc(result, 9);
    memcpy(result, "Infinity", 8);
    result[8] = '\0';
    if (neg) {
      result = (char*)realloc(result, 10);
      memmove(result + 1, result, 8);
      result[0] = '-';
      result[9] = '\0';
    }
    return result;
  }
  if (d < 1e-6) {
    double exp = 1.0;
    while (true) {
      d *= 10.0;
      double digit = floor(d);
      if (digit != 0.0) {
        const char* decStr = dtoa(d);
        size_t decLen = strlen(decStr);
        const char* expStr = dtoa(exp);
        size_t expLen = strlen(expStr);
        result = (char*)realloc(result, decLen + 2 + expLen + 1);
        resultLen = decLen + 2 + expLen;
        memcpy(result, decStr, decLen);
        delete decStr;
        memcpy(result + decLen, "e-", 2);
        memcpy(result + decLen + 2, expStr, expLen);
        delete expStr;
        result[decLen + 2 + expLen] = '\0';
        break;
      }
      d -= digit;
      exp += 1.0;
    }
    if (neg) {
      result = (char*)realloc(result, resultLen + 2);
      memmove(result + 1, result, resultLen);
      result[0] = '-';
      result[resultLen + 1] = '\0';
    }
    return result;
  } else if (d >= 1e+21) {
    double exp = 1.0;
    while (true) {
      d /= 10.0;
      double digit = floor(fmod(d, 10.0));
      if (d < 10.0) {
        const char* decStr = dtoa(d);
        size_t decLen = strlen(decStr);
        const char* expStr = dtoa(exp);
        size_t expLen = strlen(expStr);
        result = (char*)realloc(result, decLen + 2 + expLen + 1);
        resultLen = decLen + 2 + expLen;
        memcpy(result, decStr, decLen);
        delete decStr;
        memcpy(result + decLen, "e+", 2);
        memcpy(result + decLen + 2, expStr, expLen);
        delete expStr;
        result[decLen + 2 + expLen] = '\0';
        break;
      }
      exp += 1.0;
    }
    if (neg) {
      result = (char*)realloc(result, resultLen + 2);
      memmove(result + 1, result, resultLen);
      result[0] = '-';
      result[resultLen + 1] = '\0';
    }
    return result;
  }
  double intd = floor(d);
  d -= intd;
  d1 -= floor(d1);
  d2 -= floor(d2);
  if (intd == 0.0) {
    result = (char*)realloc(result, 3);
    result[resultLen++] = '0';
    result[resultLen++] = '.';
    result[resultLen] = '\0';
  } else {
    double exp = 1.0;
    while (intd >= exp) {
      double digit = floor(fmod(intd / exp, 10.0));
      result = (char*)realloc(result, ++resultLen + 1);
      memmove(result + 1, result, resultLen);
      result[0] = '0' + (char)digit;
      result[resultLen] = '\0';
      exp *= 10.0;
    }
    if (d != 0.0) {
      result = (char*)realloc(result, ++resultLen + 1);
      result[resultLen - 1] = '.';
      result[resultLen] = '\0';
    }
  }
  int diff = 0b00;
  double exp = 10.0;
  int zeros = 0;
  while (d > 0.0) {
    double digit = floor(fmod(d * exp, 10.0));
    double digit1 = floor(fmod(d1 * exp, 10.0));
    double digit2 = floor(fmod(d2 * exp, 10.0));
    if (digit == 0.0)
      ++zeros;
    else {
      result = (char*)realloc(result, resultLen + zeros + 2);
      memset(result + resultLen, '0', zeros);
      resultLen += zeros;
      result[resultLen++] = '0' + (char)digit;
      result[resultLen] = '\0';
      zeros = 0;
    }
    if (digit != digit1)
      diff |= 0b10;
    if (digit != digit2)
      diff |= 0b01;
    if (diff == 0b11) {
      exp *= 10.0;
      digit = floor(fmod(d * exp, 10.0));
      if (digit >= 5.0) {
        if (zeros--) {
          result = (char*)realloc(result, resultLen + zeros + 2);
          memset(result + resultLen, '0', zeros);
          resultLen += zeros;
          result[resultLen++] = '1';
          result[resultLen] = '\0';
          break;
        }
        bool afterDot = false;
        for (int i = resultLen - 1; i >= 0; --i) {
          if (result[i] == '.') {
            afterDot = true;
            continue;
          }
          if (result[i] == '9') {
            if (afterDot) {
              result[i] = '0';
              if (i == 0) {
                result = (char*)realloc(result, resultLen + 2);
                memmove(result + 1, result, resultLen);
                result[0] = '1';
                result[resultLen + 1] = '\0';
                ++resultLen;
              }
            } else {
              result = (char*)realloc(result, resultLen);
              result[--resultLen] = '\0';
            }
          } else {
            ++result[i];
            break;
          }
        }
      }
      break;
    }
    d -= digit / exp;
    d1 -= digit1 / exp;
    d2 -= digit2 / exp;
    exp *= 10.0;
  }
  if (neg) {
    result = (char*)realloc(result, resultLen + 2);
    memmove(result + 1, result, resultLen);
    result[0] = '-';
    result[resultLen + 1] = '\0';
  }
  return result;
}