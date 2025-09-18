/**
 * Enum que define os tipos de tecnologia de medição de velocidade
 * para máquinas industriais
 */
export enum SpeedMeasureTech {
  // Medição por duração de período
  PERIOD_DURATION_PER_SECOND = 0,

  // Medição por ciclos
  CYCLES_PER_HOUR = 1,
  CYCLES_PER_MINUTE = 2,
  CYCLES_PER_SECOND = 3,

  // Velocidade linear em metros
  LINEAR_SPEED_METERS_PER_SECOND = 4,
  LINEAR_SPEED_METERS_PER_MINUTE = 5,
  LINEAR_SPEED_METERS_PER_HOUR = 6,

  // Velocidade angular em radianos
  ANGULAR_SPEED_RADIANS_PER_SECOND = 7,
  ANGULAR_SPEED_RADIANS_PER_MINUTE = 8,
  ANGULAR_SPEED_RADIANS_PER_HOUR = 9,

  // Velocidade angular em graus
  ANGULAR_SPEED_DEGREES_PER_SECOND = 10,
  ANGULAR_SPEED_DEGREES_PER_MINUTE = 11,
  ANGULAR_SPEED_DEGREES_PER_HOUR = 12,

  // Velocidade angular em rotações
  ANGULAR_SPEED_RPS = 13, // Rotações por segundo
  ANGULAR_SPEED_RPM = 14, // Rotações por minuto
  ANGULAR_SPEED_RPH = 15, // Rotações por hora

  // Frequência
  FREQUENCY_HZ = 16, // Hertz
}

/**
 * Função helper para obter a descrição legível de um tipo de medição
 */
export function getSpeedMeasureTechDescription(type: SpeedMeasureTech): string {
  const descriptions: Record<SpeedMeasureTech, string> = {
    [SpeedMeasureTech.PERIOD_DURATION_PER_SECOND]:
      'Duração do período por segundo',
    [SpeedMeasureTech.CYCLES_PER_HOUR]: 'Ciclos por hora',
    [SpeedMeasureTech.CYCLES_PER_MINUTE]: 'Ciclos por minuto',
    [SpeedMeasureTech.CYCLES_PER_SECOND]: 'Ciclos por segundo',
    [SpeedMeasureTech.LINEAR_SPEED_METERS_PER_SECOND]:
      'Velocidade linear (m/s)',
    [SpeedMeasureTech.LINEAR_SPEED_METERS_PER_MINUTE]:
      'Velocidade linear (m/min)',
    [SpeedMeasureTech.LINEAR_SPEED_METERS_PER_HOUR]: 'Velocidade linear (m/h)',
    [SpeedMeasureTech.ANGULAR_SPEED_RADIANS_PER_SECOND]:
      'Velocidade angular (rad/s)',
    [SpeedMeasureTech.ANGULAR_SPEED_RADIANS_PER_MINUTE]:
      'Velocidade angular (rad/min)',
    [SpeedMeasureTech.ANGULAR_SPEED_RADIANS_PER_HOUR]:
      'Velocidade angular (rad/h)',
    [SpeedMeasureTech.ANGULAR_SPEED_DEGREES_PER_SECOND]:
      'Velocidade angular (graus/s)',
    [SpeedMeasureTech.ANGULAR_SPEED_DEGREES_PER_MINUTE]:
      'Velocidade angular (graus/min)',
    [SpeedMeasureTech.ANGULAR_SPEED_DEGREES_PER_HOUR]:
      'Velocidade angular (graus/h)',
    [SpeedMeasureTech.ANGULAR_SPEED_RPS]: 'Rotações por segundo (RPS)',
    [SpeedMeasureTech.ANGULAR_SPEED_RPM]: 'Rotações por minuto (RPM)',
    [SpeedMeasureTech.ANGULAR_SPEED_RPH]: 'Rotações por hora (RPH)',
    [SpeedMeasureTech.FREQUENCY_HZ]: 'Frequência (Hz)',
  };

  return descriptions[type] || 'Tipo de medição desconhecido';
}

/**
 * Função helper para obter a unidade de medida de um tipo
 */
export function getSpeedMeasureTechUnit(type: SpeedMeasureTech): string {
  const units: Record<SpeedMeasureTech, string> = {
    [SpeedMeasureTech.PERIOD_DURATION_PER_SECOND]: 's',
    [SpeedMeasureTech.CYCLES_PER_HOUR]: 'ciclos/h',
    [SpeedMeasureTech.CYCLES_PER_MINUTE]: 'ciclos/min',
    [SpeedMeasureTech.CYCLES_PER_SECOND]: 'ciclos/s',
    [SpeedMeasureTech.LINEAR_SPEED_METERS_PER_SECOND]: 'm/s',
    [SpeedMeasureTech.LINEAR_SPEED_METERS_PER_MINUTE]: 'm/min',
    [SpeedMeasureTech.LINEAR_SPEED_METERS_PER_HOUR]: 'm/h',
    [SpeedMeasureTech.ANGULAR_SPEED_RADIANS_PER_SECOND]: 'rad/s',
    [SpeedMeasureTech.ANGULAR_SPEED_RADIANS_PER_MINUTE]: 'rad/min',
    [SpeedMeasureTech.ANGULAR_SPEED_RADIANS_PER_HOUR]: 'rad/h',
    [SpeedMeasureTech.ANGULAR_SPEED_DEGREES_PER_SECOND]: 'graus/s',
    [SpeedMeasureTech.ANGULAR_SPEED_DEGREES_PER_MINUTE]: 'graus/min',
    [SpeedMeasureTech.ANGULAR_SPEED_DEGREES_PER_HOUR]: 'graus/h',
    [SpeedMeasureTech.ANGULAR_SPEED_RPS]: 'RPS',
    [SpeedMeasureTech.ANGULAR_SPEED_RPM]: 'RPM',
    [SpeedMeasureTech.ANGULAR_SPEED_RPH]: 'RPH',
    [SpeedMeasureTech.FREQUENCY_HZ]: 'Hz',
  };

  return units[type] || '';
}

/**
 * Função helper para validar se um valor é um tipo válido
 */
export function isValidSpeedMeasureTech(
  value: number
): value is SpeedMeasureTech {
  return Object.values(SpeedMeasureTech).includes(value);
}
