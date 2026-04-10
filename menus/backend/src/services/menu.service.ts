// MenuService - Lógica de negocio para obtener el menú según la mesa
// Valida que la mesa exista y esté activa, luego devuelve productos disponibles

import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error-handler";

export const menuService = {
  /**
   * Obtiene los datos de una mesa y los productos disponibles del menú.
   * Lanza AppError si la mesa no existe o está inactiva.
   */
  async getMenuByTable(tableNumber: number) {
    // Verificar que la mesa existe y está activa
    const table = await prisma.table.findUnique({
      where: { number: tableNumber },
    });

    if (!table) {
      throw new AppError(`Mesa número ${tableNumber} no encontrada`, 404);
    }

    if (!table.active) {
      throw new AppError(`La mesa número ${tableNumber} no está disponible`, 400);
    }

    // Obtener todos los productos disponibles con su categoría
    const products = await prisma.product.findMany({
      where: { available: true },
      include: { category: true },
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    });

    // Agrupar productos por categoría para facilitar el renderizado en frontend
    const productsByCategory = products.reduce(
      (acc, product) => {
        const categoryName = product.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          available: product.available,
          category: categoryName,
        });
        return acc;
      },
      {} as Record<string, object[]>
    );

    return {
      table: {
        id: table.id,
        number: table.number,
        qrCode: table.qrCode,
      },
      menu: productsByCategory,
      // Lista plana también disponible para el carrito
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        imageUrl: p.imageUrl,
        available: p.available,
        category: p.category.name,
      })),
    };
  },
};