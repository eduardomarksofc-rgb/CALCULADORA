export interface CrediarioPlan {
  installments: number; // 10, 11, etc.
  interestRate: number; // e.g., 0% or 7.91% as 0.0791 or 7.91
  labelSemEntrada: string; // "10x"
  labelComEntrada: string; // "1 + 10"
}

export interface SimulationResult {
  plan: CrediarioPlan;
  productValue: number;
  entryValue: number;
  financedValue: number;
  interestValue: number;
  totalFinal: number;
  installmentValue: number;
  hasEntry: boolean;
}

export interface SavedSimulation {
  id: string;
  clientName: string;
  productName: string;
  productValue: number;
  entryValue: number;
  installments: number;
  interestRate: number;
  installmentValue: number;
  totalFinal: number;
  timestamp: string;
}
