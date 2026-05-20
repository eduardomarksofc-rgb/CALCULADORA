import React, { useState, useEffect } from "react";
import { CREDIARIO_PLANS, getCalculatedSimulation } from "./data";
import { CrediarioPlan } from "./types";
import { 
  Calculator, 
  RotateCcw, 
  Copy, 
  Share2, 
  Check, 
  TrendingUp, 
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";

export default function App() {
  // Safe inputs
  const [productValueInput, setProductValueInput] = useState<string>("2000");
  const [entryValueInput, setEntryValueInput] = useState<string>("500");
  const [selectedPlan, setSelectedPlan] = useState<CrediarioPlan>(CREDIARIO_PLANS[0]); // Starts at 10x
  const [copied, setCopied] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showPlansModal, setShowPlansModal] = useState<boolean>(false);

  // PWA elements for automatic/one-click installation banner
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      // Prevents the standard mini-infobar UI from appearing instantly
      e.preventDefault();
      // Store the event so it can be triggered on user action
      setDeferredPrompt(e);
      // Display the beautiful custom download alert
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // If already nested inside standalone display, suppress launcher installation prompt banner
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Launch Chrome install prompt
    deferredPrompt.prompt();
    
    // Observe selection decision
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA decision user selection: ${outcome}`);

    // Clean up
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Parse calculations
  const productValue = parseFloat(productValueInput) || 0;
  const rawEntryValue = parseFloat(entryValueInput) || 0;
  
  // Rule checks
  const entryValue = Math.min(productValue, Math.max(0, rawEntryValue));
  const financedValue = Math.max(0, productValue - entryValue);

  // Result simulation
  const result = getCalculatedSimulation(productValue, entryValue, selectedPlan);

  // Fast formatter
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const handleClear = () => {
    setProductValueInput("");
    setEntryValueInput("");
    setSelectedPlan(CREDIARIO_PLANS[0]);
  };

  const getShareableText = () => {
    const isZeroRate = selectedPlan.interestRate === 0;
    const planLabel = entryValue > 0 ? selectedPlan.labelComEntrada : selectedPlan.labelSemEntrada;
    
    const valorProduto = formatBRL(productValue).replace("R$", "").trim();
    const entrada = formatBRL(entryValue).replace("R$", "").trim();
    const valorFinanciado = formatBRL(financedValue).replace("R$", "").trim();
    const plano = planLabel;
    const juros = selectedPlan.interestRate.toFixed(2).replace(".", ",");
    const valorJuros = formatBRL(result.interestValue).replace("R$", "").trim();
    const parcelas = selectedPlan.installments;
    const valorParcela = formatBRL(result.installmentValue).replace("R$", "").trim();
    const totalFinal = formatBRL(result.totalFinal).replace("R$", "").trim();

    return `📄 *SIMULAÇÃO DE CREDIÁRIO - COMERCIAL OLIVEIRA*

💰 *Valor do Produto:* R$ ${valorProduto}
💵 *Entrada:* R$ ${entrada}
📉 *Valor Financiado:* R$ ${valorFinanciado}

━━━━━━━━━━━━━━

📌 *Plano Selecionado:* ${plano}
📈 *Taxa de Juros:* ${juros}%${isZeroRate ? " (Sem Juros)" : ""}
📊 *Valor dos Juros:* R$ ${valorJuros}

💳 *Parcelamento:* *${parcelas}x de R$ ${valorParcela}*

━━━━━━━━━━━━━━

🏦 *Total Final:* *R$ ${totalFinal}*

⚡ _Feito pelo aplicativo oficial de simulações Comercial Oliveira._\n`;
  };

  const handleCopy = async () => {
    try {
      const simulationText = getShareableText();
      await navigator.clipboard.writeText(simulationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar para clipboard", err);
    }
  };

  const handleWhatsAppShare = () => {
    const simulationText = getShareableText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(simulationText)}`;
    window.open(whatsappUrl, "_blank");
  };

  const isZeroRate = selectedPlan.interestRate === 0;
  const currentPlanLabel = entryValue > 0 ? selectedPlan.labelComEntrada : selectedPlan.labelSemEntrada;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col items-center">

      <div className="w-full max-w-xl px-4 py-4 flex-1 flex flex-col justify-between gap-4">
        
        {/* Simple elegant header with less vertical spacing */}
        <header className="text-center space-y-0.5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            Comercial Oliveira
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Simulador de Vendas Rápido
          </p>
        </header>

        {/* Dynamic PWA Install application banner (Chrome / Android responsive bottom sheet feel) */}
        {isInstallable && (
          <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-2xl p-3 flex items-center justify-between shadow-xs mt-1 animate-fade-in relative overflow-hidden text-white border border-emerald-950/20">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3 pointer-events-none select-none">
              <Calculator size={90} className="text-emerald-500" />
            </div>
            <div className="flex-1 mr-2 relative z-10 text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="bg-emerald-500 text-slate-950 text-[8px] font-black uppercase px-1 py-0.5 rounded tracking-wider">APLICATIVO</span>
                <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">Instalação Direta</span>
              </div>
              <h4 className="text-xs font-black tracking-tight mt-0.5 text-white leading-tight">Instalar Comercial Oliveira</h4>
              <p className="text-[9px] text-slate-300 leading-normal mt-0.5 font-medium">Use offline direto da tela inicial, em tela cheia e super fluido!</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 relative z-10 ms-auto">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider transition cursor-pointer select-none active:scale-95 shadow-sm"
              >
                Instalar
              </button>
              <button
                type="button"
                onClick={() => setIsInstallable(false)}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                title="Fechar"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Compact Form area: White, beautiful background cards */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3">
          
          {/* Product and Entrada inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Input R$ Produto */}
            <div className="space-y-1">
              <div className="flex justify-between items-center h-4">
                <label 
                  className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none" 
                  htmlFor="product-val"
                >
                  Valor do Produto
                </label>
                <span className="text-[8px] text-slate-400 font-bold uppercase select-none tracking-wider font-sans leading-none">
                  Obrigatório
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none select-none">
                  R$
                </span>
                <input
                  id="product-val"
                  type="number"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={productValueInput}
                  onChange={(e) => setProductValueInput(e.target.value)}
                  className="w-full h-11 text-sm font-bold bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-4 focus:ring-slate-100 rounded-xl pl-9 pr-2 text-slate-900 outline-none transition"
                />
              </div>
            </div>

            {/* Input R$ Entrada (Optional) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center h-4">
                <label 
                  className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none" 
                  htmlFor="entry-val"
                >
                  Valor Entrada
                </label>
                <span className="text-[8px] text-slate-400 font-bold uppercase select-none tracking-wider font-sans leading-none">
                  Opcional
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none select-none">
                  R$
                </span>
                <input
                  id="entry-val"
                  type="number"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={entryValueInput}
                  onChange={(e) => setEntryValueInput(e.target.value)}
                  className="w-full h-11 text-sm font-bold bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-4 focus:ring-slate-100 rounded-xl pl-9 pr-2 text-slate-900 outline-none transition"
                />
              </div>
            </div>

          </div>

          {/* Quick presets for downs - perfect 4-column grid */}
          {productValue > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Atalhos de Entrada:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {/* Zero Option */}
                <button
                  id="preset-0"
                  type="button"
                  onClick={() => setEntryValueInput("")}
                  className={`h-11 flex flex-col items-center justify-center rounded-xl border text-center transition cursor-pointer select-none leading-none ${
                    entryValue === 0 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-slate-50 border-slate-200/80 text-slate-650 hover:bg-slate-100/50"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tight">Zero</span>
                  <span className="text-[8px] opacity-75 mt-0.5 font-medium">R$ 0</span>
                </button>

                {/* Percent Options: 15%, 25%, 35% */}
                {[0.15, 0.25, 0.35].map((pct) => {
                  const calculatedPreset = Math.round(productValue * pct);
                  const isActive = Math.abs(entryValue - calculatedPreset) < 1;
                  return (
                    <button
                      key={pct}
                      id={`entry-val-preset-${pct * 100}`}
                      type="button"
                      onClick={() => setEntryValueInput(calculatedPreset.toString())}
                      className={`h-11 flex flex-col items-center justify-center rounded-xl border text-center transition cursor-pointer select-none leading-none ${
                        isActive 
                          ? "bg-emerald-900 border-emerald-900 text-white font-bold" 
                          : "bg-slate-50 border-slate-200/80 text-slate-650 hover:bg-slate-100/50"
                      }`}
                    >
                      <span className="text-[10px] font-black tracking-tight">{pct * 100}%</span>
                      <span className={`text-[8px] mt-0.5 font-medium ${isActive ? "opacity-90" : "text-slate-400"}`}>
                        {formatBRL(calculatedPreset)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHOOSE PLAN BUTTON: Saves space & places parcel selection directly adjacent to inputs */}
          {productValue > 0 && (
            <button
              id="trigger-choose-plans-modal"
              type="button"
              onClick={() => setShowPlansModal(true)}
              className="w-full h-12 mt-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl px-4 flex items-center justify-between text-slate-800 transition cursor-pointer active:scale-[0.99]"
            >
              <div className="flex flex-col text-left justify-center py-1">
                <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">
                  Plano Selecionado
                </span>
                <span className="text-[13px] font-extrabold text-slate-900 leading-none mt-0.5">
                  {currentPlanLabel} <span className="text-[10px] font-bold text-slate-400">({selectedPlan.interestRate === 0 ? "Taxa Zero" : `${selectedPlan.interestRate.toFixed(2).replace(".", ",")}%`})</span>
                </span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-3xs">
                <span>Escolher</span>
                <ChevronDown size={11} className="opacity-95" />
              </div>
            </button>
          )}

        </div>

        {/* Showcase Calculation Dashboard Area */}
        {productValue > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
            
            {/* Soft Olive Green Hero panel displaying GIANT Rate with tighter padding */}
            <div className="bg-emerald-50/50 border-b border-emerald-100/80 p-4 text-center space-y-0.5">
              <span className="text-[9px] font-black tracking-widest text-emerald-800 uppercase">
                PARCELAS MENSAIS • {currentPlanLabel}
              </span>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-2xl font-light text-emerald-855">R$</span>
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                  {formatBRL(result.installmentValue).replace("R$", "").trim()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {isZeroRate 
                  ? "✓ Isento de taxa adicional comercial" 
                  : `✓ Inclui ${selectedPlan.interestRate.toFixed(2).replace(".", ",")}% de juros sobre saldo`}
              </p>
            </div>

            {/* Concise numerical breakdown rows with tighter padding */}
            <div className="p-3.5 grid grid-cols-2 gap-3 text-left border-b border-slate-100 bg-slate-50/20">
              
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Valor Financiado
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatBRL(financedValue)}
                </span>
                <span className="text-[9px] text-slate-400 block leading-none">
                  Preço menos entrada
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Juros s/ Saldo ({selectedPlan.interestRate.toFixed(2).replace(".", ",") || "0"}%)
                </span>
                <span className={`text-sm font-bold ${isZeroRate ? "text-emerald-700 font-bold" : "text-amber-700"}`}>
                  {isZeroRate ? "Grátis (0%)" : formatBRL(result.interestValue)}
                </span>
                <span className="text-[9px] text-slate-400 block leading-none">
                  Encargo do financiamento
                </span>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-between items-center bg-transparent">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total Final Contratado
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {formatBRL(result.totalFinal)}
                  </span>
                </div>
                {entryValue > 0 && (
                  <div className="text-right bg-slate-50 px-2 py-1 rounded-lg border border-slate-150">
                    <span className="text-[9px] text-slate-600 block leading-tight">
                      Entrada de <span className="font-bold text-slate-900">{formatBRL(entryValue)}</span>
                    </span>
                    <span className="text-[8px] text-slate-400 block leading-none">
                      Não incide juros
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Elegant collapsible help toggled with an interactive option */}
            <div className="border-b border-slate-100">
              <button
                id="toggle-help-rules"
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="w-full py-2 px-3 flex items-center justify-between text-[10px] font-bold text-slate-500 bg-slate-50/20 hover:bg-slate-50/80 transition cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5">
                  <Info size={12} className="text-emerald-700" />
                  Regra de Juros (Entrada s/ Juros)
                </span>
                <span className="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-black uppercase tracking-tight">
                  {showHelp ? "Ocultar" : "Como funciona?"}
                </span>
              </button>

              {showHelp && (
                <div id="help-drawer" className="p-3 bg-emerald-50/30 text-[10px] text-slate-600 leading-normal border-t border-slate-100">
                  <span className="font-bold text-emerald-900 block mb-0.5">Operação Comercial Oliveira:</span>
                  A entrada fornecida é descontada imediatamente do preço do produto e <strong className="text-emerald-950">não recebe acréscimo de juros</strong>. Os juros fixados do plano incidem unicamente sobre o saldo que for financiado.
                </div>
              )}
            </div>

            {/* Large high-contrast CTA buttons in narrower pads - comfortable h-12 targets for one hand ease */}
            <div className="p-2.5 bg-white grid grid-cols-2 gap-2.5">
              
              <button
                id="copy-text-action"
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 h-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs hover:bg-slate-100 active:scale-95 transition cursor-pointer select-none"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-700 animate-bounce" />
                    <span className="text-emerald-700">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="text-slate-500" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                id="share-whatsapp-action"
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-1.5 h-12 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 active:scale-95 transition cursor-pointer select-none"
              >
                <Share2 size={13} />
                <span>Enviar WhatsApp</span>
              </button>

            </div>

          </div>
        ) : (
          <div className="bg-slate-100 border border-dashed border-slate-200 rounded-2xl py-8 px-4 text-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-slate-200/50 mx-auto flex items-center justify-center">
              <Calculator className="text-slate-400" size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pronto para Simulação
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                Digite um valor para o produto no topo da tela para visualizar instantaneamente todas as prestações e juros da Comercial Oliveira.
              </p>
            </div>
          </div>
        )}

        {/* Pure & Clear reset button block bottom */}
        {productValue > 0 && (
          <button
            id="reset-calculator-action"
            type="button"
            onClick={handleClear}
            className="w-full h-8 rounded-xl border border-dashed border-red-200 bg-red-50 text-red-700 font-semibold text-[10px] hover:bg-red-100 transition duration-150 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1"
          >
            <RotateCcw size={10} />
            Limpar Campos
          </button>
        )}

      </div>

      {/* MODAL / BOTTOM SHEET for picking installment plans */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          {/* Backdrop Click Closer Helper for instant dismissal */}
          <div className="absolute inset-0 cursor-default" onClick={() => setShowPlansModal(false)} />
          
          <div 
            className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[75vh] animate-slide-up z-10"
          >
            {/* Drag Handle Indicator (Mobile-first look & feel) */}
            <div className="flex justify-center pt-2.5 pb-0.5 sm:hidden bg-white shrink-0">
              <div className="w-12 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="text-emerald-600 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-905 tracking-tight">
                  Opções de Parcelamento
                </h3>
              </div>
              <button
                id="close-plans-modal-btn"
                type="button"
                onClick={() => setShowPlansModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100/70 flex items-center justify-center text-slate-500 hover:bg-slate-205/80 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Plans List Area with comfortable touch targets & minimal heights inside bottom sheet */}
            <div className="p-3 overflow-y-auto divide-y divide-slate-100/80 max-h-[50vh] sm:max-h-[55vh]">
              {CREDIARIO_PLANS.map((plan) => {
                const previewSim = getCalculatedSimulation(productValue, entryValue, plan);
                const isSelected = selectedPlan.installments === plan.installments;
                const isZero = plan.interestRate === 0;
                const labelText = entryValue > 0 ? plan.labelComEntrada : plan.labelSemEntrada;

                return (
                  <button
                    key={plan.installments}
                    id={`modal-plan-select-btn-${plan.installments}`}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowPlansModal(false); // Auto close on select for high speed
                    }}
                    className={`w-full py-3 px-3.5 my-0.5 rounded-xl text-left flex items-center justify-between transition gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/50 text-emerald-955 border border-emerald-500/20 shadow-3xs"
                        : "bg-white hover:bg-slate-50 border border-transparent text-slate-800"
                    }`}
                  >
                    {/* Left: Installment description & small interest */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className={`text-xs tracking-tight ${isSelected ? "font-black text-emerald-900" : "font-semibold text-slate-800"}`}>
                        {labelText}
                      </span>
                      <span className={`text-[10px] font-bold tracking-tight ${isZero ? "text-emerald-700 font-extrabold" : "text-amber-700"}`}>
                        {isZero ? "Taxa Zero Sem Juros" : `${plan.interestRate.toFixed(2).replace(".", ",")}% a.m.`}
                      </span>
                    </div>

                    {/* Right: Big prominent value */}
                    <div className="text-right shrink-0">
                      <span className={`block text-sm tracking-tight font-sans ${isSelected ? "font-black text-emerald-800" : "font-extrabold text-slate-900"}`}>
                        {formatBRL(previewSim.installmentValue)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Premium action drawer footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-center shrink-0">
              <button
                id="modal-confirm-close-btn"
                type="button"
                onClick={() => setShowPlansModal(false)}
                className="w-full h-11 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              >
                Voltar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modern, elegant, clean footer with smaller margin */}
      <footer className="w-full bg-white border-t border-slate-200 mt-auto py-4 text-center px-4">
        <p className="text-[10px] font-medium text-slate-400 tracking-wide">
          Desenvolvido por Eduardo Marques
        </p>
      </footer>

    </div>
  );
}
