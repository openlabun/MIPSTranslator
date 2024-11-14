/**
 * Convierte una cadena binaria a su representación hexadecimal.
 * @param binaryString La cadena binaria a convertir.
 * @returns La cadena hexadecimal.
 */
export function binaryToHex(binaryString: string): string {
  while (binaryString.length % 4 !== 0) {
    binaryString = '0' + binaryString;
  }
  let hexString = '';
  for (let i = 0; i < binaryString.length; i += 4) {
    const binaryChunk = binaryString.substring(i, i + 4);
    const hexDigit = parseInt(binaryChunk, 2).toString(16);
    hexString += hexDigit;
  }
  return hexString.toUpperCase(); // Sin '0x'
}

export function formatImmediateHex(binaryString: string): string {
  const hexString = binaryToHex(binaryString);
  return `0x${hexString}`;
}


/**
 * Convierte una cadena hexadecimal a su representación binaria.
 * @param hex La cadena hexadecimal a convertir.
 * @returns La cadena binaria.
 */
export function hexToBinary(hex: string): string {
  let binary = '';
  for (let i = 0; i < hex.length; i++) {
    let bin = parseInt(hex[i], 16).toString(2);
    binary += bin.padStart(4, '0');
  }
  return binary;
}
