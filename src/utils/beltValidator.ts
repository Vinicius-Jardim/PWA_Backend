import { belts, BeltType } from "../models/userModel";

// Helper function to validate multiple belt levels
export function validateBeltLevels(beltLevels: string[]): BeltType[] {
  const validBeltLevels = Object.values(belts);
  const beltTranslations = {
    WHITE: "Branca",
    YELLOW: "Amarela",
    ORANGE: "Laranja",
    GREEN: "Verde",
    BLUE: "Azul",
    BROWN: "Marrom",
    BLACK: "Preta"
  };
  
  const invalidBelts = beltLevels.filter(
    (beltLevel) => !validBeltLevels.includes(beltLevel as BeltType)
  );
  
  if (invalidBelts.length > 0) {
    const validBeltsFormatted = validBeltLevels
      .map(belt => `${belt} (${beltTranslations[belt as keyof typeof beltTranslations]})`)
      .join(", ");
      
    throw new Error(`Faixas inválidas: ${invalidBelts.join(", ")}. \nAs faixas válidas são: ${validBeltsFormatted}`);
  }
  
  return beltLevels as BeltType[];
}
