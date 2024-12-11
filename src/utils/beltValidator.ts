import { belts, BeltType } from "../models/userModel";

// Helper function to validate multiple belt levels
export function validateBeltLevels(beltLevels: string[]): BeltType[] {
  const validBeltLevels = Object.values(belts);
  
  // Check if every belt level in the array is valid
  if (!beltLevels.every((beltLevel) => validBeltLevels.includes(beltLevel as BeltType))) {
    throw new Error("One or more belt levels are invalid");
  }
  
  return beltLevels as BeltType[];
}
