import { Shift } from '../../domain/entities/Shift';
import {
  CreateShiftDTO,
  DeleteShiftDTO,
  GetAllShiftsDTO,
  GetAllShiftsResponseDTO,
  GetShiftByIdDTO,
  RestoreShiftDTO,
  ShiftResponseDTO,
  ShiftStatisticsDTO,
  UpdateShiftDTO,
} from '../dto/ShiftDTO';
import { IShiftRepository } from '../interfaces/IShiftRepository';

export class ShiftApplicationService {
  constructor(private shiftRepository: IShiftRepository) {}

  async createShift(
    data: CreateShiftDTO,
    tenantId: string
  ): Promise<ShiftResponseDTO> {
    // Validar se já existe um turno com o mesmo nome no tenant
    const existingShift = await this.shiftRepository.findByNameAndTenant(
      data.shiftName,
      tenantId
    );

    if (existingShift) {
      throw new Error('Já existe um turno com este nome');
    }

    // Validar horários
    this.validateShiftTimes(data.shiftStart, data.shiftEnd);

    const shift = await this.shiftRepository.create({
      shiftName: data.shiftName,
      shiftStart: data.shiftStart,
      shiftEnd: data.shiftEnd,
      tenantId,
    });

    return this.mapToResponseDTO(shift);
  }

  async getShiftById(
    data: GetShiftByIdDTO,
    tenantId: string
  ): Promise<ShiftResponseDTO> {
    const shift = await this.shiftRepository.findById({
      shiftId: data.shiftId,
      tenantId,
    });

    if (!shift) {
      throw new Error('Turno não encontrado');
    }

    return this.mapToResponseDTO(shift);
  }

  async getAllShifts(
    data: GetAllShiftsDTO,
    tenantId: string
  ): Promise<GetAllShiftsResponseDTO> {
    const result = await this.shiftRepository.findAll({
      tenantId,
      page: data.page,
      limit: data.limit,
      search: data.search,
      includeDeleted: data.includeDeleted,
    });

    return {
      shifts: result.shifts,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async updateShift(
    shiftId: string,
    data: UpdateShiftDTO,
    tenantId: string
  ): Promise<ShiftResponseDTO> {
    // Verificar se o turno existe
    const existingShift = await this.shiftRepository.findById({
      shiftId,
      tenantId,
    });

    if (!existingShift) {
      throw new Error('Turno não encontrado');
    }

    if (existingShift.isDeleted()) {
      throw new Error('Não é possível editar um turno excluído');
    }

    // Se estiver alterando o nome, verificar se já existe outro com o mesmo nome
    if (data.shiftName && data.shiftName !== existingShift.shiftName) {
      const shiftWithSameName = await this.shiftRepository.findByNameAndTenant(
        data.shiftName,
        tenantId
      );

      if (shiftWithSameName && shiftWithSameName.shiftId !== shiftId) {
        throw new Error('Já existe um turno com este nome');
      }
    }

    // Se estiver alterando horários, validar
    if (data.shiftStart || data.shiftEnd) {
      const newStart = data.shiftStart || existingShift.shiftStart;
      const newEnd = data.shiftEnd || existingShift.shiftEnd;
      this.validateShiftTimes(newStart, newEnd);
    }

    const updatedShift = await this.shiftRepository.update({
      shiftId,
      shiftName: data.shiftName,
      shiftStart: data.shiftStart,
      shiftEnd: data.shiftEnd,
      tenantId,
    });

    return this.mapToResponseDTO(updatedShift);
  }

  async deleteShift(data: DeleteShiftDTO, tenantId: string): Promise<void> {
    // Verificar se o turno existe
    const existingShift = await this.shiftRepository.findById({
      shiftId: data.shiftId,
      tenantId,
    });

    if (!existingShift) {
      throw new Error('Turno não encontrado');
    }

    if (existingShift.isDeleted()) {
      throw new Error('Turno já foi excluído');
    }

    await this.shiftRepository.delete({
      shiftId: data.shiftId,
      tenantId,
    });
  }

  async restoreShift(
    data: RestoreShiftDTO,
    tenantId: string
  ): Promise<ShiftResponseDTO> {
    // Verificar se o turno existe
    const existingShift = await this.shiftRepository.findById({
      shiftId: data.shiftId,
      tenantId,
    });

    if (!existingShift) {
      throw new Error('Turno não encontrado');
    }

    if (!existingShift.isDeleted()) {
      throw new Error('Turno não foi excluído');
    }

    const restoredShift = await this.shiftRepository.restore({
      shiftId: data.shiftId,
      tenantId,
    });

    return this.mapToResponseDTO(restoredShift);
  }

  async getActiveShifts(tenantId: string): Promise<ShiftResponseDTO[]> {
    const shifts = await this.shiftRepository.findActiveShifts(tenantId);
    return shifts.map(shift => this.mapToResponseDTO(shift));
  }

  async getShiftsByTimeRange(
    startTime: string,
    endTime: string,
    tenantId: string
  ): Promise<ShiftResponseDTO[]> {
    this.validateTimeFormat(startTime);
    this.validateTimeFormat(endTime);

    const shifts = await this.shiftRepository.findShiftsByTimeRange(
      startTime,
      endTime,
      tenantId
    );

    return shifts.map(shift => this.mapToResponseDTO(shift));
  }

  async getShiftStatistics(tenantId: string): Promise<ShiftStatisticsDTO> {
    const allShifts = await this.shiftRepository.findAll({
      tenantId,
      includeDeleted: true,
      limit: 1000, // Buscar todos para estatísticas
    });

    const totalShifts = allShifts.total;
    const activeShifts = allShifts.shifts.filter(
      shift => !shift.deletedAt
    ).length;
    const deletedShifts = totalShifts - activeShifts;

    // Calcular duração média dos turnos
    let totalDuration = 0;
    let validShifts = 0;

    allShifts.shifts.forEach(shift => {
      if (!shift.deletedAt) {
        const duration = this.calculateShiftDuration(
          shift.shiftStart,
          shift.shiftEnd
        );
        totalDuration += duration;
        validShifts++;
      }
    });

    const averageShiftDuration =
      validShifts > 0 ? totalDuration / validShifts : 0;

    // Classificar turnos por período
    const shiftsByTimeRange = {
      morning: 0, // 06:00 - 12:00
      afternoon: 0, // 12:00 - 18:00
      night: 0, // 18:00 - 06:00
    };

    allShifts.shifts.forEach(shift => {
      if (
        !shift.deletedAt &&
        shift.shiftStart &&
        shift.shiftStart.trim() !== ''
      ) {
        const timeParts = shift.shiftStart.split(':');
        if (timeParts.length >= 1 && timeParts[0]) {
          const startHour = parseInt(timeParts[0]);
          if (startHour >= 6 && startHour < 12) {
            shiftsByTimeRange.morning++;
          } else if (startHour >= 12 && startHour < 18) {
            shiftsByTimeRange.afternoon++;
          } else {
            shiftsByTimeRange.night++;
          }
        }
      }
    });

    return {
      totalShifts,
      activeShifts,
      deletedShifts,
      averageShiftDuration: Math.round(averageShiftDuration),
      shiftsByTimeRange,
    };
  }

  private validateShiftTimes(start: string, end: string): void {
    this.validateTimeFormat(start);
    this.validateTimeFormat(end);

    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    if (startMinutes === endMinutes) {
      throw new Error('Horário de início e fim não podem ser iguais');
    }
  }

  private validateTimeFormat(time: string): void {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new Error('Formato de hora inválido. Use HH:MM');
    }
  }

  private timeToMinutes(time: string): number {
    const parts = time.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 60 + minutes;
  }

  private calculateShiftDuration(start: string, end: string): number {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    if (endMinutes > startMinutes) {
      return endMinutes - startMinutes;
    } else {
      // Turno que passa da meia-noite
      return 24 * 60 - startMinutes + endMinutes;
    }
  }

  private mapToResponseDTO(shift: Shift): ShiftResponseDTO {
    return {
      shiftId: shift.shiftId,
      shiftName: shift.shiftName,
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
      tenantId: shift.tenantId,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
      deletedAt: shift.deletedAt,
    };
  }
}
