export const medicineDatabase: Record<
  string,
  {
    name: string;
    status: 'safe' | 'caution' | 'banned';
    message: string;
  }
> = {
  '8901234567890': {
    name: 'Paracetamol',
    status: 'safe',
    message: 'Allowed under WADA rules.',
  },

  '8901234567891': {
    name: 'Ventolin',
    status: 'caution',
    message:
      'Contains Salbutamol. Check dosage limits.',
  },

  '8901234567892': {
    name: 'Clenbuterol',
    status: 'banned',
    message:
      'Prohibited substance under WADA regulations.',
  },
};