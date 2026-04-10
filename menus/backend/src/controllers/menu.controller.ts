// MenuController - Manejo de requests relacionados al menú por mesa

import { Request, Response, NextFunction } from "express";
import { menuService } from "../services/menu.service";
import { AppError } from "../middleware/error-handler";

export const menuController = {
  /**
   * GET /api/menu/:tableNumber
   * Devuelve datos de la mesa y el menú de productos disponibles.
   */
  async getMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tableNumber = Number(req.params.tableNumber);
      if (isNaN(tableNumber) || tableNumber <= 0) {
        throw new AppError("El número de mesa debe ser un número positivo", 400);
      }

      const data = await menuService.getMenuByTable(tableNumber);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};