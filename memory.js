/**
 * @type {ArrayBuffer[]}
 */
let pages = [];
/**
 * @type {{ offset: bigint, size: bigint }[]}
 */
let allocedRegions = [];

/**
 * @param {bigint} address
 * @returns {{ page: ArrayBuffer, offset: number }}
 */
function findPageIndexAndOffset(address) {
  let pageIndex = 0;
  let offset = address;
  for (let i = 0; i < pages.length; ++i) {
    if (offset < 65536n) {
      pageIndex = i;
      break;
    }
    offset -= 65536n;
  }
  return { page: pages[pageIndex], offset: Number(offset) };
}

/**
 * @param {bigint} address
 * @returns {number}
 */
function readInt8(address) {
  let num = readUint8(address);
  if (num >= 0x80)
    num -= 0x100;
  return num;
}

/**
 * @param {bigint} address
 * @returns {number}
 */
function readUint8(address) {
  const { page, offset } = findPageIndexAndOffset(address);
  return new DataView(page).getUint8(offset);
}

/**
 * @param {bigint} address
 * @param {number} value
 */
function writeInt8(address, value) {
  writeUint8(address, value);
}

/**
 * @param {bigint} address
 * @param {number} value
 */
function writeUint8(address, value) {
  const { page, offset } = findPageIndexAndOffset(address);
  new DataView(page).setUint8(offset, value);
}

/**
 * @param {bigint} address
 * @returns {number}
 */
function readInt16(address) {
  let num = readUint16(address);
  if (num >= 0x8000)
    num -= 0x10000;
  return num;
}

/**
 * @param {bigint} address
 * @returns {number}
 */
function readUint16(address) {
  return (((readUint8(address) << 8) >>> 0) | readUint8(address + 1n)) >>> 0;
}

/**
 * @param {bigint} address
 * @param {number} value
 */
function writeInt16(address, value) {
  writeUint16(address, value);
}

/**
 * @param {bigint} address
 * @param {number} value
 */
function writeUint16(address, value) {
  if (value < 0)
    value += 0x10000;
  writeUint8(address, (value >> 8) & 0xFF);
  writeUint8(address + 1n, value & 0xFF);
}

/**
 * @param {bigint} address
 * @returns {number}
 */
function readInt32(address) {
  let num = readUint32(address);
  if (num >= 0x80000000)
    num -= 0x100000000;
  return num;
}

/**
 * @param {bigint} address
 * @returns {number}
 */
function readUint32(address) {
  return (((readUint16(address) << 16) >>> 0) | readUint16(address + 2n)) >>> 0;
}

/**
 * @param {bigint} address
 * @param {number} value
 */
function writeInt32(address, value) {
  writeUint32(address, value);
}

/**
 * @param {bigint} address
 * @param {number} value
 */
function writeUint32(address, value) {
  if (value < 0)
    value += 0x100000000;
  writeUint16(address, (value >> 16) & 0xFFFF);
  writeUint16(address + 2n, value & 0xFFFF);
}

/**
 * @param {bigint} address
 * @returns {bigint}
 */
function readInt64(address) {
  let num = readUint64(address);
  if (num >= 0x8000000000000000n)
    num -= 0x10000000000000000n;
  return num;
}

/**
 * @param {bigint} address
 * @returns {bigint}
 */
function readUint64(address) {
  return (BigInt(readUint32(address)) << 32n) | BigInt(readUint32(address + 4n));
}

/**
 * @param {bigint} address
 * @param {bigint} value
 */
function writeInt64(address, value) {
  writeUint64(address, value);
}

/**
 * @param {bigint} address
 * @param {bigint} value
 */
function writeUint64(address, value) {
  if (value < 0n)
    value += 0x10000000000000000n;
  writeUint32(address, Number((value >> 16n) & 0xFFFFFFFFn));
  writeUint32(address + 4n, Number(value & 0xFFFFFFFFn));
}

/**
 * @param {bigint} size
 * @returns {bigint}
 */
function findBestFit(size) {
  let bestFit = null;
  let smallestSize = BigInt(Number.MAX_VALUE);
  const firstRegion = allocedRegions[0] || { offset: BigInt(Number.MAX_VALUE) };
  if (size < firstRegion.offset)
    return 0n;
  for (let i = 0; i != allocedRegions.length; ++i) {
    const region = allocedRegions[i];
    const nextRegion = allocedRegions[i + 1] || { offset: BigInt(Number.MAX_VALUE) };
    if ((region.offset + region.size) + size <= nextRegion.offset) {
      const size2 = nextRegion.offset - (region.offset + region.size);
      if (smallestSize > size2 || (size2 === BigInt(Number.MAX_VALUE) && bestFit === null)) {
        bestFit = region.offset + region.size;
        smallestSize = size2;
        if (smallestSize == size)
          break;
      }
    }
  }
  return bestFit;
}

/**
 * @param {bigint} size
 * @returns {bigint}
 */
function malloc(size) {
  size = BigInt(size);
  let bestFit = findBestFit(size)
  let totalSize = 65536n * BigInt(pages.length);

  while (bestFit + size > totalSize) {
    pages.push(new ArrayBuffer(65536));
    totalSize += 65536n;
  }

  let insertIndex = allocedRegions.length;
  for (let i = 0; i < allocedRegions.length; i++) {
    if (allocedRegions[i].offset > bestFit) {
      insertIndex = i;
      break;
    }
  }
  allocedRegions.splice(insertIndex, 0, {
    offset: bestFit,
    size
  });

  return bestFit;
}

/**
 * @param {bigint} address
 */
function free(address) {
  address = BigInt(address);
  const i = allocedRegions.findIndex(region => region.offset === address);
  if (i === -1)
    return;
  if (i === allocedRegions.length - 1) {
    const prevRegion = allocedRegions[i - 1] || { offset: 0n, size: 0n };
    while (prevRegion.offset + prevRegion.size <= (65536 * (pages.length - 1)))
      pages.pop();
  }
  allocedRegions.splice(i, 1);
}

/**
 * @param {bigint} address
 * @param {bigint} size
 * @returns {bigint}
 */
function realloc(address, size) {
  address = BigInt(address);
  size = BigInt(size);
  const i = allocedRegions.findIndex(region => region.offset === address);
  if (i === -1)
    return;
  const currentRegion = allocedRegions[i];
  const nextRegion = allocedRegions[i + 1] || { offset: BigInt(Number.MAX_VALUE) };
  if (currentRegion.offset + size <= nextRegion.offset) {
    currentRegion.size = size;
    return address;
  }
  const newAddr = malloc(size);
  let bytesToCopy = currentRegion.size;
  let destOff = newAddr;
  let srcOff = address;
  while (bytesToCopy / 8n >= 1n) {
    writeUint64(destOff, readUint64(srcOff));
    destOff += 8n;
    srcOff += 8n;
    bytesToCopy -= 8n;
  }
  if (bytesToCopy / 4n >= 1n) {
    writeUint32(destOff, readUint32(srcOff));
    destOff += 4n;
    srcOff += 4n;
    bytesToCopy -= 4n;
  }
  if (bytesToCopy / 2n >= 1n) {
    writeUint16(destOff, readUint16(srcOff));
    destOff += 2n;
    srcOff += 2n;
    bytesToCopy -= 2n;
  }
  if (bytesToCopy >= 1n) {
    writeUint8(destOff, readUint8(srcOff));
    ++destOff;
    ++srcOff;
    --bytesToCopy;
  }
  free(address);
  return newAddr;
}

const e = {
  malloc,
  free,
  realloc,
  readInt8,
  readUint8,
  readInt16,
  readUint16,
  readInt32,
  readUint32,
  readInt64,
  readUint64,
  writeInt8,
  writeUint8,
  writeInt16,
  writeUint16,
  writeInt32,
  writeUint32,
  writeInt64,
  writeUint64,
};

if (typeof window !== 'undefined')
  Object.assign(window, e);
else module.exports = e;