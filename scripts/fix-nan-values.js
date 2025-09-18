const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixNaNValues() {
  console.log('🔧 Iniciando correção de valores NaN...');

  try {
    // Buscar sensores com valores NaN
    const sensorsWithNaN = await prisma.$queryRaw`
      SELECT 
        sensor_id,
        name,
        min_scale,
        max_scale,
        min_alarm,
        max_alarm,
        gain,
        "offset",
        alarm_timeout,
        ix,
        sampling_interval,
        minimum_period,
        maximum_period,
        frequency_resolution
      FROM "Sensor" 
      WHERE 
        (min_scale IS NOT NULL AND (min_scale::text = 'NaN' OR min_scale != min_scale)) OR
        (max_scale IS NOT NULL AND (max_scale::text = 'NaN' OR max_scale != max_scale)) OR
        (min_alarm IS NOT NULL AND (min_alarm::text = 'NaN' OR min_alarm != min_alarm)) OR
        (max_alarm IS NOT NULL AND (max_alarm::text = 'NaN' OR max_alarm != max_alarm)) OR
        (gain IS NOT NULL AND (gain::text = 'NaN' OR gain != gain)) OR
        ("offset" IS NOT NULL AND ("offset"::text = 'NaN' OR "offset" != "offset")) OR
        (alarm_timeout IS NOT NULL AND (alarm_timeout::text = 'NaN' OR alarm_timeout != alarm_timeout)) OR
        (ix IS NOT NULL AND (ix::text = 'NaN' OR ix != ix)) OR
        (sampling_interval IS NOT NULL AND (sampling_interval::text = 'NaN' OR sampling_interval != sampling_interval)) OR
        (minimum_period IS NOT NULL AND (minimum_period::text = 'NaN' OR minimum_period != minimum_period)) OR
        (maximum_period IS NOT NULL AND (maximum_period::text = 'NaN' OR maximum_period != maximum_period)) OR
        (frequency_resolution IS NOT NULL AND (frequency_resolution::text = 'NaN' OR frequency_resolution != frequency_resolution))
    `;

    console.log(
      `📊 Encontrados ${sensorsWithNaN.length} sensores com valores NaN`
    );

    if (sensorsWithNaN.length === 0) {
      console.log('✅ Nenhum valor NaN encontrado. Banco de dados está limpo!');
      return;
    }

    // Mostrar sensores afetados
    console.log('🔍 Sensores com valores NaN:');
    sensorsWithNaN.forEach((sensor, index) => {
      console.log(`${index + 1}. ${sensor.name} (ID: ${sensor.sensor_id})`);
    });

    // Corrigir valores NaN
    console.log('🔧 Corrigindo valores NaN...');

    const updateResult = await prisma.$executeRaw`
      UPDATE "Sensor" 
      SET 
        min_scale = CASE 
          WHEN min_scale IS NOT NULL AND (min_scale::text = 'NaN' OR min_scale != min_scale) 
          THEN NULL ELSE min_scale END,
        max_scale = CASE 
          WHEN max_scale IS NOT NULL AND (max_scale::text = 'NaN' OR max_scale != max_scale) 
          THEN NULL ELSE max_scale END,
        min_alarm = CASE 
          WHEN min_alarm IS NOT NULL AND (min_alarm::text = 'NaN' OR min_alarm != min_alarm) 
          THEN NULL ELSE min_alarm END,
        max_alarm = CASE 
          WHEN max_alarm IS NOT NULL AND (max_alarm::text = 'NaN' OR max_alarm != max_alarm) 
          THEN NULL ELSE max_alarm END,
        gain = CASE 
          WHEN gain IS NOT NULL AND (gain::text = 'NaN' OR gain != gain) 
          THEN NULL ELSE gain END,
        "offset" = CASE 
          WHEN "offset" IS NOT NULL AND ("offset"::text = 'NaN' OR "offset" != "offset") 
          THEN NULL ELSE "offset" END,
        alarm_timeout = CASE 
          WHEN alarm_timeout IS NOT NULL AND (alarm_timeout::text = 'NaN' OR alarm_timeout != alarm_timeout) 
          THEN NULL ELSE alarm_timeout END,
        ix = CASE 
          WHEN ix IS NOT NULL AND (ix::text = 'NaN' OR ix != ix) 
          THEN NULL ELSE ix END,
        sampling_interval = CASE 
          WHEN sampling_interval IS NOT NULL AND (sampling_interval::text = 'NaN' OR sampling_interval != sampling_interval) 
          THEN NULL ELSE sampling_interval END,
        minimum_period = CASE 
          WHEN minimum_period IS NOT NULL AND (minimum_period::text = 'NaN' OR minimum_period != minimum_period) 
          THEN NULL ELSE minimum_period END,
        maximum_period = CASE 
          WHEN maximum_period IS NOT NULL AND (maximum_period::text = 'NaN' OR maximum_period != maximum_period) 
          THEN NULL ELSE maximum_period END,
        frequency_resolution = CASE 
          WHEN frequency_resolution IS NOT NULL AND (frequency_resolution::text = 'NaN' OR frequency_resolution != frequency_resolution) 
          THEN NULL ELSE frequency_resolution END
    `;

    console.log(`✅ ${updateResult} registros atualizados com sucesso!`);

    // Verificar se ainda existem valores NaN
    const remainingNaN = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Sensor" 
      WHERE 
        (min_scale IS NOT NULL AND (min_scale::text = 'NaN' OR min_scale != min_scale)) OR
        (max_scale IS NOT NULL AND (max_scale::text = 'NaN' OR max_scale != max_scale)) OR
        (min_alarm IS NOT NULL AND (min_alarm::text = 'NaN' OR min_alarm != min_alarm)) OR
        (max_alarm IS NOT NULL AND (max_alarm::text = 'NaN' OR max_alarm != max_alarm)) OR
        (gain IS NOT NULL AND (gain::text = 'NaN' OR gain != gain)) OR
        ("offset" IS NOT NULL AND ("offset"::text = 'NaN' OR "offset" != "offset")) OR
        (alarm_timeout IS NOT NULL AND (alarm_timeout::text = 'NaN' OR alarm_timeout != alarm_timeout)) OR
        (ix IS NOT NULL AND (ix::text = 'NaN' OR ix != ix)) OR
        (sampling_interval IS NOT NULL AND (sampling_interval::text = 'NaN' OR sampling_interval != sampling_interval)) OR
        (minimum_period IS NOT NULL AND (minimum_period::text = 'NaN' OR minimum_period != minimum_period)) OR
        (maximum_period IS NOT NULL AND (maximum_period::text = 'NaN' OR maximum_period != maximum_period)) OR
        (frequency_resolution IS NOT NULL AND (frequency_resolution::text = 'NaN' OR frequency_resolution != frequency_resolution))
    `;

    const remainingCount = remainingNaN[0].count;

    if (remainingCount === '0') {
      console.log('🎉 Todos os valores NaN foram corrigidos com sucesso!');
    } else {
      console.log(
        `⚠️  Ainda existem ${remainingCount} registros com valores NaN`
      );
    }
  } catch (error) {
    console.error('❌ Erro ao corrigir valores NaN:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixNaNValues()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro na execução:', error);
      process.exit(1);
    });
}

module.exports = { fixNaNValues };
