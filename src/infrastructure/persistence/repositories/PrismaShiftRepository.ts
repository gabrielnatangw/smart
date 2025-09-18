import { PrismaClient } from '@prisma/client';

import {
  CreateShiftRequest,
  DeleteShiftRequest,
  GetAllShiftsRequest,
  GetAllShiftsResponse,
  GetShiftByIdRequest,
  IShiftRepository,
  RestoreShiftRequest,
  ShiftResponse,
  UpdateShiftRequest,
} from '../../../application/interfaces/IShiftRepository';
import { Shift } from '../../../domain/entities/Shift';

export class PrismaShiftRepository implements IShiftRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateShiftRequest): Promise<Shift> {
    const shiftData = await this.prisma.shift.create({
      data: {
        shift_name: data.shiftName,
        shift_start: data.shiftStart,
        shift_end: data.shiftEnd,
        tenant_id: data.tenantId,
      },
    });

    return Shift.restore(
      shiftData.shift_id,
      shiftData.shift_name,
      shiftData.shift_start,
      shiftData.shift_end,
      shiftData.tenant_id,
      shiftData.created_at,
      shiftData.updated_at || undefined,
      shiftData.deleted_at || undefined
    );
  }

  async findById(data: GetShiftByIdRequest): Promise<Shift | null> {
    const shiftData = await this.prisma.shift.findFirst({
      where: {
        shift_id: data.shiftId,
        tenant_id: data.tenantId,
      },
    });

    if (!shiftData) {
      return null;
    }

    return Shift.restore(
      shiftData.shift_id,
      shiftData.shift_name,
      shiftData.shift_start,
      shiftData.shift_end,
      shiftData.tenant_id,
      shiftData.created_at,
      shiftData.updated_at || undefined,
      shiftData.deleted_at || undefined
    );
  }

  async findAll(data: GetAllShiftsRequest): Promise<GetAllShiftsResponse> {
    const { page = 1, limit = 10, search, includeDeleted = false } = data;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: data.tenantId,
    };

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    if (search) {
      where.shift_name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [shifts, total] = await Promise.all([
      this.prisma.shift.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.shift.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      shifts: shifts.map(shift => this.mapToResponse(shift)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(data: UpdateShiftRequest): Promise<Shift> {
    const updateData: any = {};

    if (data.shiftName !== undefined) {
      updateData.shift_name = data.shiftName;
    }
    if (data.shiftStart !== undefined) {
      updateData.shift_start = data.shiftStart;
    }
    if (data.shiftEnd !== undefined) {
      updateData.shift_end = data.shiftEnd;
    }

    updateData.updated_at = new Date();

    const shiftData = await this.prisma.shift.update({
      where: {
        shift_id: data.shiftId,
      },
      data: updateData,
    });

    return Shift.restore(
      shiftData.shift_id,
      shiftData.shift_name,
      shiftData.shift_start,
      shiftData.shift_end,
      shiftData.tenant_id,
      shiftData.created_at,
      shiftData.updated_at || undefined,
      shiftData.deleted_at || undefined
    );
  }

  async delete(data: DeleteShiftRequest): Promise<void> {
    await this.prisma.shift.update({
      where: {
        shift_id: data.shiftId,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async restore(data: RestoreShiftRequest): Promise<Shift> {
    const shiftData = await this.prisma.shift.update({
      where: {
        shift_id: data.shiftId,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return Shift.restore(
      shiftData.shift_id,
      shiftData.shift_name,
      shiftData.shift_start,
      shiftData.shift_end,
      shiftData.tenant_id,
      shiftData.created_at,
      shiftData.updated_at || undefined,
      shiftData.deleted_at || undefined
    );
  }

  async findByNameAndTenant(
    shiftName: string,
    tenantId: string
  ): Promise<Shift | null> {
    const shiftData = await this.prisma.shift.findFirst({
      where: {
        shift_name: shiftName,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!shiftData) {
      return null;
    }

    return Shift.restore(
      shiftData.shift_id,
      shiftData.shift_name,
      shiftData.shift_start,
      shiftData.shift_end,
      shiftData.tenant_id,
      shiftData.created_at,
      shiftData.updated_at || undefined,
      shiftData.deleted_at || undefined
    );
  }

  async findActiveShifts(tenantId: string): Promise<Shift[]> {
    const shiftsData = await this.prisma.shift.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: {
        shift_start: 'asc',
      },
    });

    return shiftsData.map(shift =>
      Shift.restore(
        shift.shift_id,
        shift.shift_name,
        shift.shift_start,
        shift.shift_end,
        shift.tenant_id,
        shift.created_at,
        shift.updated_at || undefined,
        shift.deleted_at || undefined
      )
    );
  }

  async findShiftsByTimeRange(
    startTime: string,
    endTime: string,
    tenantId: string
  ): Promise<Shift[]> {
    const shiftsData = await this.prisma.shift.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        OR: [
          {
            shift_start: {
              gte: startTime,
              lte: endTime,
            },
          },
          {
            shift_end: {
              gte: startTime,
              lte: endTime,
            },
          },
          {
            AND: [
              {
                shift_start: {
                  lte: startTime,
                },
              },
              {
                shift_end: {
                  gte: endTime,
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        shift_start: 'asc',
      },
    });

    return shiftsData.map(shift =>
      Shift.restore(
        shift.shift_id,
        shift.shift_name,
        shift.shift_start,
        shift.shift_end,
        shift.tenant_id,
        shift.created_at,
        shift.updated_at || undefined,
        shift.deleted_at || undefined
      )
    );
  }

  async existsByNameAndTenant(
    shiftName: string,
    tenantId: string
  ): Promise<boolean> {
    const count = await this.prisma.shift.count({
      where: {
        shift_name: shiftName,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async existsByIdAndTenant(
    shiftId: string,
    tenantId: string
  ): Promise<boolean> {
    const count = await this.prisma.shift.count({
      where: {
        shift_id: shiftId,
        tenant_id: tenantId,
      },
    });

    return count > 0;
  }

  private mapToResponse(shiftData: any): ShiftResponse {
    return {
      shiftId: shiftData.shift_id,
      shiftName: shiftData.shift_name,
      shiftStart: shiftData.shift_start,
      shiftEnd: shiftData.shift_end,
      tenantId: shiftData.tenant_id,
      createdAt: shiftData.created_at,
      updatedAt: shiftData.updated_at || undefined,
      deletedAt: shiftData.deleted_at || undefined,
    };
  }
}
