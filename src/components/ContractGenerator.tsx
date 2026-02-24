import { FileText, Printer, Briefcase, User, Settings, RefreshCw, Save, Plus, Trash2, Clock, Calculator } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

// Types
interface Obligation {
  id: string;
  description: string;
  deadline: string;
}

interface ContractorProfile {
  id: string;
  name: string;
  doc: string; // CPF or CNPJ
  address: string;
  registry: string; // CRC
  type: 'PF' | 'PJ';
}

interface ContractData {
  // Contractor Selection
  contractorProfileId: string;
  
  // Client Data
  clientName: string;
  clientCNPJ: string;
  clientAddress: string;
  clientRepresentative: string;
  clientRepDoc: string; // CPF/CNPJ of Rep

  // Service Details
  serviceScope: string;
  monthlyFee: string;
  startDate: string;
  contractDuration: string;
  city: string;

  // Editable Clauses
  clause7: string;
  clause7Para1: string;
  clause7Para2: string;
  clause8: string;

  // Obligations Annex
  obligations: Obligation[];
}

// Constants
const CONTRACTOR_PROFILES: ContractorProfile[] = [
  {
    id: 'lucas',
    name: 'LUCAS ARAUJO DOS SANTOS',
    doc: 'CPF nº 060.940.115-70',
    registry: 'CRC BA-046968/O',
    address: '1ª Travessa da Rua B, nº 130, Loteamento Nova Vida, CEP 44.330-000, São Gonçalo dos Campos / BA',
    type: 'PF'
  },
  {
    id: 'virgula',
    name: 'VIRGULA CONTABIL LTDA',
    doc: 'CNPJ nº 52.613.515/0001-60',
    registry: 'CRC BA-046968/O',
    address: 'Rua José Bonifacio, Centro, CEP 44.330-000 São Gonçalo dos Campos / BA',
    type: 'PJ'
  }
];

const INITIAL_DATA: ContractData = {
  contractorProfileId: 'lucas',
  clientName: "",
  clientCNPJ: "",
  clientAddress: "",
  clientRepresentative: "",
  clientRepDoc: "",
  serviceScope: `1. CONTABILIDADE
1.1. Elaboração da Contabilidade de acordo com as Normas Brasileiras de Contabilidade.
1.2. Emissão de balancetes.
1.3. Elaboração de Balanço Patrimonial e demais Demonstrações Contábeis obrigatórias.
2. OBRIGAÇÕES FISCAIS
2.1. Orientação e controle de aplicação dos dispositivos legais vigentes, sejam federais, estaduais ou
municipais.
2.2. Elaboração dos registros fiscais obrigatórios, eletrônicos ou não, perante os órgãos municipais,
estaduais e federais, bem como as demais obrigações que se fizerem necessárias.
2.3. Atendimento às demais exigências previstas na legislação, bem como aos eventuais procedimentos
fiscais.
3 . DEPARTAMENTO DE PESSOAL
3.1. Registros de empregados e serviços correlatos.
3.2. Elaboração da folha de pagamento dos empregados e de pró-labore, bem como das guias de
recolhimento dos encargos sociais e tributos afins.
3.3. Elaboração, orientação e controle da aplicação dos preceitos da Consolidação das Leis do Trabalho,
bem como daqueles atinentes à Previdência Social e de outros aplicáveis às relações de trabalho
mantidas pela contratante`,
  monthlyFee: "1.500,00",
  startDate: new Date().toISOString().split('T')[0],
  contractDuration: "Indeterminado",
  city: "São Gonçalo dos Campos",
  
  clause7: "O(A) contratante pagará ao contratado(a) pelos serviços prestados os honorários mensais de R$ [VALOR], com vencimento em até o quinto dia util do mês subsequente.",
  clause7Para1: "Os honorários serão reajustados anualmente em comum acordo entre as partes ou quando houver aumento dos serviços contratados.",
  clause7Para2: "Os honorários abrangem até 10 funcionários. A partir do 11º, será acrescido 15% a cada grupo de 5 funcionários adicionais, ainda que incompleto.",
  clause8: "No mês de dezembro de cada ano, será cobrado o equivalente a 1 (um) honorário mensal, a ser pago até o dia 20 daquele mês por conta do Encerramento do Balanço Patrimonial e demais obrigações anuais.",
  
  obligations: [
    { id: '1', description: 'Entrega dos extratos bancários', deadline: 'Até o quinto dia do mês subsequente' }
  ]
};

export default function ContractGenerator() {
  const [data, setData] = useState<ContractData>(INITIAL_DATA);
  const [savedContracts, setSavedContracts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Load saved contracts on mount
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      if (res.ok) {
        const contracts = await res.json();
        setSavedContracts(contracts);
      }
    } catch (err) {
      console.error("Failed to fetch contracts", err);
    }
  };

  const handleSave = async () => {
    if (!data.clientName) {
      alert("Por favor, preencha o nome do cliente antes de salvar.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: data.clientName, data })
      });
      if (res.ok) {
        alert("Contrato salvo com sucesso!");
        fetchContracts();
      } else {
        alert("Erro ao salvar contrato.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar contrato.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (id: number) => {
    try {
      const res = await fetch(`/api/contracts/${id}`);
      if (res.ok) {
        const contract = await res.json();
        setData(contract.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados do cliente?")) {
      setData({ ...INITIAL_DATA, contractorProfileId: data.contractorProfileId });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const addObligation = () => {
    const newObligation: Obligation = {
      id: Date.now().toString(),
      description: '',
      deadline: ''
    };
    setData(prev => ({ ...prev, obligations: [...prev.obligations, newObligation] }));
  };

  const updateObligation = (id: string, field: keyof Obligation, value: string) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.map(obs => 
        obs.id === id ? { ...obs, [field]: value } : obs
      )
    }));
  };

  const removeObligation = (id: string) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.filter(obs => obs.id !== id)
    }));
  };

  const selectedContractor = CONTRACTOR_PROFILES.find(p => p.id === data.contractorProfileId) || CONTRACTOR_PROFILES[0];

  // Helper to replace placeholders in clauses
  const formatClause = (text: string) => {
    return text.replace('[VALOR]', data.monthlyFee);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 print:bg-white">
      {/* Header - Hidden on Print */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between print:hidden sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-4 cursor-pointer">
          <div className="w-12 h-12 bg-virgula-card rounded-xl border border-white/10 flex items-center justify-center text-virgula-green shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Calculator size={30} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-3xl font-bold text-white tracking-tight leading-none mb-0.5">Vírgula</span>
            <span className="text-base font-semibold text-virgula-green tracking-widest leading-none uppercase">Contábil</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} />
            <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Limpar</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all shadow-md hover:shadow-lg text-sm font-medium"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden print:overflow-visible print:block h-[calc(100vh-73px)]">
        {/* Sidebar Form - Hidden on Print */}
        <aside className="w-full lg:w-[450px] bg-white border-r border-slate-200 overflow-y-auto p-6 print:hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 custom-scrollbar">
          <div className="space-y-8 pb-10">
            
            {/* Saved Contracts List */}
            {savedContracts.length > 0 && (
              <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contratos Salvos</h2>
                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2">
                  {savedContracts.map(c => (
                    <div key={c.id} onClick={() => handleLoad(c.id)} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 cursor-pointer hover:border-indigo-500 transition-colors text-sm">
                      <span className="truncate flex-1 font-medium">{c.clientName || 'Sem nome'}</span>
                      <span className="text-xs text-slate-400 ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contractor Section */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                <Briefcase size={14} className="text-indigo-600" />
                Contratada (Você)
              </h2>
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Selecione o Perfil</label>
                <div className="space-y-2">
                  {CONTRACTOR_PROFILES.map(profile => (
                    <label key={profile.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${data.contractorProfileId === profile.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                      <input 
                        type="radio" 
                        name="contractorProfileId" 
                        value={profile.id} 
                        checked={data.contractorProfileId === profile.id}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{profile.name}</div>
                        <div className="text-xs text-slate-500">{profile.doc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Client Section */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                <User size={14} className="text-indigo-600" />
                Contratante (Cliente)
              </h2>
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Input label="Razão Social / Nome" name="clientName" value={data.clientName} onChange={handleChange} placeholder="Nome do Cliente" />
                <Input label="CNPJ / CPF" name="clientCNPJ" value={data.clientCNPJ} onChange={handleChange} placeholder="00.000.000/0000-00" />
                <Input label="Endereço Completo" name="clientAddress" value={data.clientAddress} onChange={handleChange} placeholder="Rua do Cliente, 123" />
                <div className="grid grid-cols-1 gap-3 pt-2 border-t border-slate-200">
                  <Input label="Representante Legal" name="clientRepresentative" value={data.clientRepresentative} onChange={handleChange} placeholder="Nome do Sócio" />
                  <Input label="CPF/CNPJ do Representante" name="clientRepDoc" value={data.clientRepDoc} onChange={handleChange} placeholder="CPF do Sócio" />
                </div>
              </div>
            </motion.section>

            {/* Service & Clauses */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                <Settings size={14} className="text-indigo-600" />
                Detalhes & Cláusulas
              </h2>
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Honorários (R$)" name="monthlyFee" value={data.monthlyFee} onChange={handleChange} />
                  <Input label="Cidade" name="city" value={data.city} onChange={handleChange} />
                </div>
                <Input label="Data de Início" name="startDate" type="date" value={data.startDate} onChange={handleChange} />
                <Input label="Duração" name="contractDuration" value={data.contractDuration} onChange={handleChange} />
                
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <TextArea label="Escopo dos Serviços" name="serviceScope" value={data.serviceScope} onChange={handleChange} />
                  <TextArea label="Cláusula 7 (Honorários)" name="clause7" value={data.clause7} onChange={handleChange} />
                  <TextArea label="Cláusula 7 - Parágrafo 1º (Reajuste)" name="clause7Para1" value={data.clause7Para1} onChange={handleChange} />
                  <TextArea label="Cláusula 7 - Parágrafo 2º (Adicional)" name="clause7Para2" value={data.clause7Para2} onChange={handleChange} />
                  <TextArea label="Cláusula 8 (13º Honorário)" name="clause8" value={data.clause8} onChange={handleChange} />
                </div>
              </div>
            </motion.section>

            {/* Obligations Annex */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Clock size={14} className="text-indigo-600" />
                  Prazos (Anexo)
                </h2>
                <button onClick={addObligation} className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800">
                  <Plus size={12} /> ADICIONAR
                </button>
              </div>
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {data.obligations.map((obs, index) => (
                  <div key={obs.id} className="flex gap-2 items-start group">
                    <div className="flex-1 space-y-2">
                      <input 
                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-indigo-500 outline-none"
                        placeholder="Descrição da Obrigação"
                        value={obs.description}
                        onChange={(e) => updateObligation(obs.id, 'description', e.target.value)}
                      />
                      <input 
                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-indigo-500 outline-none"
                        placeholder="Prazo (ex: dia 05)"
                        value={obs.deadline}
                        onChange={(e) => updateObligation(obs.id, 'deadline', e.target.value)}
                      />
                    </div>
                    <button onClick={() => removeObligation(obs.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {data.obligations.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">Nenhum prazo definido.</p>
                )}
              </div>
            </motion.section>

          </div>
        </aside>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-100/50 p-8 overflow-y-auto print:p-0 print:bg-white print:overflow-visible custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print:max-w-none min-h-[297mm] p-[20mm] text-justify text-[11pt] leading-relaxed font-serif text-slate-900 border border-slate-200 print:border-none" 
            ref={printRef}
          >
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.08] select-none overflow-hidden print:fixed print:inset-0 print:opacity-[0.06] print:z-[-1]">
              <div className="flex items-center space-x-6 transform -rotate-12 scale-[2]">
                <div className="w-24 h-24 bg-virgula-card rounded-2xl border border-slate-200 flex items-center justify-center text-virgula-green">
                  <Calculator size={56} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-6xl font-bold text-virgula-card tracking-tight leading-none mb-1">Vírgula</span>
                  <span className="text-2xl font-semibold text-virgula-green tracking-widest leading-none uppercase">Contábil</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
            <div className="text-center mb-10">
              <h1 className="font-bold text-lg uppercase tracking-wide border-b-2 border-black pb-2 inline-block">Contrato de Prestação de Serviços Contábeis</h1>
            </div>

            <div className="space-y-6">
              <p>
                Pelo presente instrumento particular de Contrato de Prestação de Serviços Contábeis, de um lado <strong>{data.clientName || "_______________________"}</strong>, inscrita no CNPJ/CPF sob o nº {data.clientCNPJ || "_______________________"}, com sede em {data.clientAddress || "_______________________"}, doravante denominada <strong>CONTRATANTE</strong>, neste ato representada por seu representante legal, <strong>{data.clientRepresentative || "_______________________"}</strong>, portador do CPF/CNPJ nº {data.clientRepDoc || "_______________________"}.
              </p>
              
              <p>
                E, de outro lado, o profissional da Contabilidade <strong>{selectedContractor.name}</strong>, {selectedContractor.doc}, registrado no {selectedContractor.registry}, residente/sediado na {selectedContractor.address}, doravante denominado(a) <strong>CONTRATADO(A)</strong>, mediante as cláusulas e condições seguintes, tem justo e contratado que se segue:
              </p>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Primeira – Do Objeto</h2>
                <p>
                  O profissional contratado obriga-se a prestar seus serviços profissionais ao contratante, nas seguintes áreas:
                </p>
                <div className="mt-2 pl-4 border-l-2 border-slate-300 italic text-slate-700 bg-slate-50 p-2 print:bg-transparent print:p-0 whitespace-pre-line">
                  {data.serviceScope}
                </div>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Segunda – Das Responsabilidades</h2>
                <p>
                  O(A) contratado(a) assume inteira responsabilidade pelos serviços técnicos a que se obrigou, assim como pelas orientações que prestar.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Terceira – Das Obrigações da Contratante</h2>
                <p>
                  A CONTRATANTE obriga-se a fornecer à CONTRATADA toda a documentação e informações necessárias para a execução dos serviços, dentro dos prazos estabelecidos, responsabilizando-se pela veracidade e legalidade dos documentos entregues.
                </p>
                <p className="mt-2">
                  Os prazos para entrega de documentos e informações constam no <strong>ANEXO I</strong> deste contrato.
                </p>
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Primeiro:</p>
                <p>
                  Responsabilizar-se-á o(a) contratado(a) por todos os documentos a ele(a)
entregue pelo(a) contratante, enquanto permanecerem sob sua guarda para a consecução dos serviços
pactuados, salvo comprovados casos fortuitos e motivos de força maior
                </p>
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Segundo:</p>
                <p>
                  O(A) Contratante tem ciência da Lei 9.613/98, alterada pela Lei 12.683/2012,
especificamente no que trata da lavagem de dinheiro, regulamentada pela Resolução CFC n.º 1.345/13
do Conselho Federal de Contabilidade.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Quarta – Da Carta de Responsabilidade</h2>
                <p>
                  O(A) contratante(a) se obriga, antes do encerramento do exercício social, a fornecer ao contratado(a) a Carta de Responsabilidade da Administração.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Quinta – Das Orientações</h2>
                <p>
                  As orientações dadas pelo(a) contratado(a) deverão ser seguidas pela contratante, eximindo-se o(a) primeiro(a) das consequências da não observância do seu cumprimento.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Sexta – Da Entrega de Documentos</h2>
                <p>
                  O(A) contratado(a) se obriga a entregar ao contratante, mediante protocolo, com tempo hábil, os balancetes, o Balanço Patrimonial e as demais demonstrações contábeis, documentos necessários para que este efetue os devidos pagamentos e recolhimentos obrigatórios, bem como comprovante de entrega das obrigações acessórias.
                </p>
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Único:</p>
                <p>
                  As multas decorrentes da entrega fora do prazo contratado das obrigações previstas no caput deste artigo, ou que forem decorrentes da imperfeição ou inexecução dos serviços por parte do(a) contratado(a), serão de sua responsabilidade.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Sétima – Dos Honorários</h2>
                <p>{formatClause(data.clause7)}</p>
                
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Primeiro:</p>
                <p>{data.clause7Para1}</p>
                
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Segundo:</p>
                <p>{data.clause7Para2}</p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Oitava – Do 13º Honorário</h2>
                <p>{data.clause8}</p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Nona – Dos Serviços Extraordinários</h2>
                <p>
                  Todos os serviços extraordinários não contratados que forem necessários ou solicitados pelo contratante serão cobrados à parte, com preços previamente convencionados.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Décima – Da Rescisão</h2>
                <p>
                  No caso de atraso no pagamento dos honorários, incidirá multa de 10%. Persistindo o atraso, por período de 3 (três) meses, o contratado(a) poderá rescindir o contrato, por motivo justificado, eximindo-se de qualquer responsabilidade a partir da data da rescisão.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Décima Primeira – Do Prazo</h2>
                <p>
                  Este instrumento é feito por tempo indeterminado, iniciando-se em <strong>{new Date(data.startDate).toLocaleDateString('pt-BR')}</strong>, podendo ser rescindido em qualquer época, por qualquer uma das partes, mediante Aviso Prévio de 30 (trinta) dias, por escrito.
                </p>
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Primeiro:</p>
                <p>
                  A parte que não comunicar por escrito a intenção de rescindir o contrato ou efetuá-la de forma sumária fica obrigada ao pagamento de multa compensatória no valor de uma parcela mensal dos honorários vigentes à época.
                </p>
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Segundo:</p>
                <p>
                  O rompimento do vínculo contratual obriga as partes à celebração de distrato com a especificação da cessação das responsabilidades dos contratantes.
                </p>
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Terceiro:</p>
                <p>
                  O(A) contratado(a) obriga-se a entregar os documentos, Livros Contábeis e Fiscais e/ou arquivos eletrônicos ao contratante ou a outro profissional da Contabilidade por ele(a) indicado(a), após a assinatura do distrato entre as partes.
                </p>
              </div>

              <div>
                <h2 className="font-bold text-sm uppercase mb-2">Cláusula Décima Segunda – Do Foro</h2>
                <p>
                  Os casos omissos serão resolvidos de comum acordo.
                </p>
                <p className="mt-2 font-bold text-xs uppercase">Parágrafo Único:</p>
                <p>
                  Em caso de impasse, as partes submeterão a solução do conflito a procedimento arbitral nos termos da Lei n.º 9.307/96.
                </p>
              </div>

              <p className="text-right mt-8 mb-16">
                {data.city}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>

              <div className="grid grid-cols-2 gap-12 mt-20 break-inside-avoid">
                <div className="text-center">
                  <div className="border-t border-black pt-2 mb-1 mx-4">
                    {data.clientRepresentative || "CONTRATANTE"}
                  </div>
                  <div className="text-xs uppercase">
                    {data.clientName}<br/>
                    Rep. Legal
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-black pt-2 mb-1 mx-4">
                    {selectedContractor.name}
                  </div>
                  <div className="text-xs uppercase">Contratado</div>
                </div>
              </div>

              {/* ANEXO I - Page Break */}
              <div className="break-before-page mt-20">
                <div className="text-center mb-10">
                  <h1 className="font-bold text-lg uppercase tracking-wide border-b-2 border-black pb-2 inline-block">ANEXO I - Prazos e Obrigações</h1>
                </div>
                
                <p className="mb-6">
                  Relação de documentos e informações a serem fornecidos pela CONTRATANTE à CONTRATADA, com seus respectivos prazos:
                </p>

                <div className="border border-slate-900">
                  <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-900 font-bold text-sm print:bg-gray-200">
                    <div className="col-span-2 p-2 border-r border-slate-900">Obrigação / Documento</div>
                    <div className="p-2">Prazo de Entrega</div>
                  </div>
                  {data.obligations.map((obs) => (
                    <div key={obs.id} className="grid grid-cols-3 border-b border-slate-900 last:border-0 text-sm">
                      <div className="col-span-2 p-2 border-r border-slate-900">{obs.description}</div>
                      <div className="p-2">{obs.deadline}</div>
                    </div>
                  ))}
                  {data.obligations.length === 0 && (
                    <div className="p-4 text-center italic text-slate-500">Nenhuma obrigação listada.</div>
                  )}
                </div>
              </div>

            </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Input({ label, name, value, onChange, placeholder, type = "text" }: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange }: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px] resize-y"
      />
    </div>
  );
}
