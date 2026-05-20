import { CrediarioPlan } from "./types";

export const CREDIARIO_PLANS: CrediarioPlan[] = [
  { installments: 10, interestRate: 0.00, labelSemEntrada: "10x", labelComEntrada: "1+10" },
  { installments: 11, interestRate: 7.91, labelSemEntrada: "11x", labelComEntrada: "1+11" },
  { installments: 12, interestRate: 8.58, labelSemEntrada: "12x", labelComEntrada: "1+12" },
  { installments: 13, interestRate: 9.26, labelSemEntrada: "13x", labelComEntrada: "1+13" },
  { installments: 14, interestRate: 9.94, labelSemEntrada: "14x", labelComEntrada: "1+14" },
  { installments: 15, interestRate: 10.63, labelSemEntrada: "15x", labelComEntrada: "1+15" },
  { installments: 16, interestRate: 11.32, labelSemEntrada: "16x", labelComEntrada: "1+16" },
  { installments: 17, interestRate: 12.01, labelSemEntrada: "17x", labelComEntrada: "1+17" },
  { installments: 18, interestRate: 12.70, labelSemEntrada: "18x", labelComEntrada: "1+18" }
];

export function getCalculatedSimulation(
  productValue: number,
  entryValue: number,
  plan: CrediarioPlan
) {
  // Ensure we don't calculate on negative elements
  const validProductValue = Math.max(0, productValue);
  const validEntryValue = Math.min(validProductValue, Math.max(0, entryValue));
  
  // Rule: A entrada nunca recebe juros. Os juros devem ser aplicados apenas no saldo financiado.
  const financedValue = validProductValue - validEntryValue;
  
  // Rate is stored as whole percentage value, e.g., 7.91%
  const rateMultiplier = plan.interestRate / 100;
  
  const interestValue = financedValue * rateMultiplier;
  const totalFinancedWithInterest = financedValue + interestValue;
  
  const totalFinal = validEntryValue + totalFinancedWithInterest;
  
  // Installment value is the total installment amount divided by the number of installments
  const installmentValue = plan.installments > 0 
    ? totalFinancedWithInterest / plan.installments 
    : 0;

  return {
    plan,
    productValue: validProductValue,
    entryValue: validEntryValue,
    financedValue,
    interestValue,
    totalFinal,
    installmentValue,
    hasEntry: validEntryValue > 0
  };
}
