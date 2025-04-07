/**
 * Represents the valid registers found in MIPS assembly.
 */
export enum Register {
  // Always zero
  zero = 0,
  r0 = zero,

  // Reserved for assembler
  at = 1,

  // First and second return values
  v0 = 2,
  v1 = 3,

  // First four arguments to functions
  a0 = 4,
  a1 = 5,
  a2 = 6,
  a3 = 7,

  // Temporary
  t0 = 8,
  t1 = 9,
  t2 = 10,
  t3 = 11,
  t4 = 12,
  t5 = 13,
  t6 = 14,
  t7 = 15,

  // Saved
  s0 = 16,
  s1 = 17,
  s2 = 18,
  s3 = 19,
  s4 = 20,
  s5 = 21,
  s6 = 22,
  s7 = 23,

  // More temporary
  t8 = 24,
  t9 = 25,

  // Reserved for kernel
  k0 = 26,
  k1 = 27,

  // Global pointer
  gp = 28,

  // Stack pointer
  sp = 29,

  // Frame pointer
  fp = 30,

  // Return address
  ra = 31,
}
