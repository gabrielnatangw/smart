import { Request, Response } from 'express';

import { TenantSubscriptionApplicationService } from '../../application/services/TenantSubscriptionApplicationService';
import {
  CreateTenantSubscriptionRequest,
  TenantSubscriptionFilters,
  UpdateTenantSubscriptionRequest,
} from '../../domain/entities/TenantSubscription';

export class TenantSubscriptionController {
  constructor(
    private tenantSubscriptionService: TenantSubscriptionApplicationService
  ) {}

  async createTenantSubscription(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateTenantSubscriptionRequest = req.body;
      const tenantSubscription =
        await this.tenantSubscriptionService.createTenantSubscription(data);

      res.status(201).json({
        success: true,
        data: tenantSubscription,
        message: 'Tenant subscription created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create tenant subscription',
      });
    }
  }

  async getTenantSubscriptionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID is required',
        });
        return;
      }
      const tenantSubscription =
        await this.tenantSubscriptionService.getTenantSubscriptionById(id);

      if (!tenantSubscription) {
        res.status(404).json({
          success: false,
          message: 'Tenant subscription not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: tenantSubscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get tenant subscription',
      });
    }
  }

  async getAllTenantSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const filters: TenantSubscriptionFilters = req.query as any;
      const result =
        await this.tenantSubscriptionService.getAllTenantSubscriptions(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get tenant subscriptions',
      });
    }
  }

  async updateTenantSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID is required',
        });
        return;
      }
      const data: UpdateTenantSubscriptionRequest = req.body;
      const tenantSubscription =
        await this.tenantSubscriptionService.updateTenantSubscription(id, data);

      res.status(200).json({
        success: true,
        data: tenantSubscription,
        message: 'Tenant subscription updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update tenant subscription',
      });
    }
  }

  async deleteTenantSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID is required',
        });
        return;
      }
      await this.tenantSubscriptionService.deleteTenantSubscription(id);

      res.status(200).json({
        success: true,
        message: 'Tenant subscription deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to delete tenant subscription',
      });
    }
  }

  async restoreTenantSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID is required',
        });
        return;
      }
      const tenantSubscription =
        await this.tenantSubscriptionService.restoreTenantSubscription(id);

      res.status(200).json({
        success: true,
        data: tenantSubscription,
        message: 'Tenant subscription restored successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to restore tenant subscription',
      });
    }
  }

  // Business Operations
  async getTenantSubscriptionsByTenant(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { tenantId } = req.params;
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
        return;
      }
      const tenantSubscriptions =
        await this.tenantSubscriptionService.getTenantSubscriptionsByTenant(
          tenantId
        );

      res.status(200).json({
        success: true,
        data: tenantSubscriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get tenant subscriptions by tenant',
      });
    }
  }

  async getTenantSubscriptionsByApplication(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { applicationId } = req.params;
      if (!applicationId) {
        res.status(400).json({
          success: false,
          message: 'Application ID is required',
        });
        return;
      }
      const tenantSubscriptions =
        await this.tenantSubscriptionService.getTenantSubscriptionsByApplication(
          applicationId
        );

      res.status(200).json({
        success: true,
        data: tenantSubscriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get tenant subscriptions by application',
      });
    }
  }

  async getTenantSubscriptionByTenantAndApplication(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { tenantId, applicationId } = req.params;
      if (!tenantId || !applicationId) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID and Application ID are required',
        });
        return;
      }
      const tenantSubscription =
        await this.tenantSubscriptionService.getTenantSubscriptionByTenantAndApplication(
          tenantId,
          applicationId
        );

      if (!tenantSubscription) {
        res.status(404).json({
          success: false,
          message: 'Tenant subscription not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: tenantSubscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get tenant subscription by tenant and application',
      });
    }
  }

  async getActiveSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const tenantSubscriptions =
        await this.tenantSubscriptionService.getActiveSubscriptions();

      res.status(200).json({
        success: true,
        data: tenantSubscriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get active subscriptions',
      });
    }
  }

  async getInactiveSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const tenantSubscriptions =
        await this.tenantSubscriptionService.getInactiveSubscriptions();

      res.status(200).json({
        success: true,
        data: tenantSubscriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get inactive subscriptions',
      });
    }
  }

  async getExpiringSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { days } = req.query;
      const daysNumber = days ? parseInt(days as string) : 30;
      const tenantSubscriptions =
        await this.tenantSubscriptionService.getExpiringSubscriptions(
          daysNumber
        );

      res.status(200).json({
        success: true,
        data: tenantSubscriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get expiring subscriptions',
      });
    }
  }

  async getExpiredSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const tenantSubscriptions =
        await this.tenantSubscriptionService.getExpiredSubscriptions();

      res.status(200).json({
        success: true,
        data: tenantSubscriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get expired subscriptions',
      });
    }
  }

  async getSubscriptionsByPlan(req: Request, res: Response): Promise<void> {
    try {
      const { plan } = req.params;
      if (!plan) {
        res.status(400).json({
          success: false,
          message: 'Plan is required',
        });
        return;
      }
      const tenantSubscriptions =
        await this.tenantSubscriptionService.getSubscriptionsByPlan(plan);

      res.status(200).json({
        success: true,
        data: tenantSubscriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get subscriptions by plan',
      });
    }
  }

  async getTenantSubscriptionStatistics(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const statistics =
        await this.tenantSubscriptionService.getTenantSubscriptionStatistics();

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get tenant subscription statistics',
      });
    }
  }

  async validateTenantSubscriptionAccess(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { tenantId, applicationId } = req.params;
      if (!tenantId || !applicationId) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID and Application ID are required',
        });
        return;
      }
      const hasAccess =
        await this.tenantSubscriptionService.validateTenantSubscriptionAccess(
          tenantId,
          applicationId
        );

      res.status(200).json({
        success: true,
        data: { hasAccess },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to validate tenant subscription access',
      });
    }
  }

  async getActiveSubscriptionCountByTenant(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { tenantId } = req.params;
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
        return;
      }
      const count =
        await this.tenantSubscriptionService.getActiveSubscriptionCountByTenant(
          tenantId
        );

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get active subscription count by tenant',
      });
    }
  }

  async getActiveSubscriptionCountByApplication(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { applicationId } = req.params;
      if (!applicationId) {
        res.status(400).json({
          success: false,
          message: 'Application ID is required',
        });
        return;
      }
      const count =
        await this.tenantSubscriptionService.getActiveSubscriptionCountByApplication(
          applicationId
        );

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get active subscription count by application',
      });
    }
  }
}
