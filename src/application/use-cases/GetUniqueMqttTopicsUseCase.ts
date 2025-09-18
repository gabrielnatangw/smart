import { IModuleRepository } from '../interfaces/IModuleRepository';

export class GetUniqueMqttTopicsUseCase {
  constructor(private moduleRepository: IModuleRepository) {}

  async execute(tenantId?: string): Promise<string[]> {
    try {
      console.log('🔍 Buscando módulos para gerar tópicos MQTT...');

      let modules: any[] = [];

      if (tenantId) {
        // Buscar módulos de um tenant específico
        // console.log(`🔍 Buscando módulos do tenant: ${tenantId}`);
        modules = await this.moduleRepository.findAll({ tenantId });
      } else {
        // Buscar módulos de TODOS os tenants
        // console.log('🔍 Buscando módulos de TODOS os tenants...');
        modules = await this.moduleRepository.findAllModules();
        // console.log(`📊 Total de módulos encontrados: ${modules.length}`);
      }

      if (!modules || modules.length === 0) {
        console.log('⚠️ Nenhum módulo encontrado no banco de dados');
        console.log('ℹ️ Sistema dinâmico aguardando módulos serem cadastrados');
        return [];
      }

      // console.log(`📊 Encontrados ${modules.length} módulos no banco`);

      const uniqueTopics = new Set<string>();

      for (const module of modules) {
        // Construir tópico baseado na estrutura do módulo
        const customer = module.customer.toLowerCase();
        const country = module.country.toLowerCase();
        const city = module.city.toLowerCase();

        // Formato: customer/country_city/#
        const topic = `${customer}/${country}_${city}/#`;

        uniqueTopics.add(topic);

        // console.log(`📋 Módulo: ${module.customer}/${module.country}_${module.city} → Tópico: ${topic}`);
      }

      const topicsArray = Array.from(uniqueTopics);
      console.log(
        `✅ Gerados ${topicsArray.length} tópicos únicos:`,
        topicsArray
      );

      return topicsArray;
    } catch (error) {
      console.error('❌ Erro ao buscar tópicos únicos:', error);
      throw error;
    }
  }
}
