import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors:
            (error as any).errors?.map((err: any) => ({
              field: err.path?.join('.') || '',
              message: err.message || 'Erro de validação',
            })) || [],
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  };
};

export const validateRequestParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 [DEBUG] Middleware: validateRequestParams chamado');
    console.log('🔍 [DEBUG] Middleware: Parâmetros recebidos:', req.params);
    console.log('🔍 [DEBUG] Middleware: URL:', req.url);
    console.log('🔍 [DEBUG] Middleware: Método:', req.method);

    try {
      const validatedData = schema.parse(req.params);
      console.log(
        '🔍 [DEBUG] Middleware: Validação bem-sucedida:',
        validatedData
      );
      req.params = validatedData as any;
      next();
    } catch (error) {
      console.error('🔍 [DEBUG] Middleware: Erro na validação:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors:
            (error as any).errors?.map((err: any) => ({
              field: err.path?.join('.') || '',
              message: err.message || 'Erro de validação',
            })) || [],
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  };
};

export const validateRequestQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('�� [DEBUG] Middleware: validateRequestQuery chamado');
    console.log('�� [DEBUG] Middleware: Query params recebidos:', req.query);
    console.log('�� [DEBUG] Middleware: URL:', req.url);
    console.log('�� [DEBUG] Middleware: Método:', req.method);

    try {
      const validatedData = schema.parse(req.query);
      console.log(
        '�� [DEBUG] Middleware: Validação de query bem-sucedida:',
        validatedData
      );

      // Não sobrescrever req.query diretamente, apenas validar
      // Os dados validados ficam disponíveis através do schema.parse()
      next();
    } catch (error) {
      console.error(
        '�� [DEBUG] Middleware: Erro na validação de query:',
        error
      );
      if (error instanceof z.ZodError) {
        console.error(
          '�� [DEBUG] Middleware: Erros de validação:',
          error.issues
        );
        return res.status(400).json({
          success: false,
          message: 'Query parameters inválidos',
          errors:
            error.issues?.map((err: any) => ({
              field: err.path?.join('.') || '',
              message: err.message || 'Erro de validação',
            })) || [],
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  };
};
