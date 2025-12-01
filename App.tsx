import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Linkedin, Mail, ArrowRight, UserCheck, Search, Award, Briefcase, 
  MapPin, Clock, Upload, FileText, Lock, LayoutDashboard, 
  Users, Building, FileCheck, LogOut, Plus, Trash2, Link as LinkIcon, CheckCircle,
  Sparkles, Copy, RefreshCw, Loader2, Phone, Eye, AlertTriangle, MessageSquare
} from 'lucide-react';
import { Logo } from './components/Logo';
import { Button } from './components/Button';

// Firebase Imports
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// --- TYPES & INTERFACES ---

type ViewState = 'public' | 'login' | 'admin';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  active: boolean;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  linkedin: string;
  externalLink?: string; 
  summary: string; 
  createdAt: any;
}

interface ClientCompany {
  id: string;
  name: string;
  email: string; 
  contactPerson: string;
}

interface OnboardingProcess {
  id: string;
  candidateName: string;
  clientId: string;
  status: 'Em Análise' | 'Aprovado' | 'Documentação Pendente' | 'Concluído';
  docsUrl?: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

// --- HELPER: FIREBASE ERRORS ---
const getErrorMessage = (error: any) => {
  if (error.code === 'auth/invalid-credential') return 'Email ou senha incorretos.';
  if (error.code === 'auth/user-not-found') return 'Usuário não encontrado.';
  if (error.code === 'auth/wrong-password') return 'Senha incorreta.';
  if (error.code === 'auth/invalid-api-key') return 'Erro de configuração da API Key.';
  return error.message;
};

// --- COMPONENT: PUBLIC WEBSITE ---

const PublicSite = ({ 
  jobs, 
  onNavigateToLogin, 
  onApply,
  onRegisterCandidate,
  loadingJobs
}: { 
  jobs: Job[], 
  onNavigateToLogin: () => void,
  onApply: (job: Job) => void,
  onRegisterCandidate: (candidate: any) => Promise<void>,
  loadingJobs: boolean
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isLinkedInToolOpen, setIsLinkedInToolOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    
    try {
      if (db) {
        await addDoc(collection(db, 'messages'), {
          ...contactForm,
          createdAt: serverTimestamp()
        });
      } else {
        // Demo mode simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Demo Message Sent:", contactForm);
      }
      
      setContactStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      
      // Reset after 5 seconds
      setTimeout(() => setContactStatus('idle'), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
      setContactStatus('idle');
    }
  };

  const NavLink = ({ href, children, mobile = false, onClick }: any) => (
    <a 
      href={href} 
      onClick={(e) => {
        if (onClick) onClick();
        if (href.startsWith('#')) {
            e.preventDefault();
            scrollToSection(href.substring(1));
        }
      }}
      className={`font-sans font-medium hover:text-brand-yellow transition-colors duration-200 ${mobile ? 'block py-3 text-lg border-b border-gray-100 text-brand-green' : 'text-gray-600'}`}
    >
      {children}
    </a>
  );

  // LinkedIn Profile Generator Modal
  const LinkedInGeneratorModal = () => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
      name: '',
      role: '',
      area: '',
      years: '',
      skills: '',
      achievement: ''
    });
    const [generated, setGenerated] = useState<{headlines: string[], abouts: string[]} | null>(null);

    const handleGenerate = () => {
      const skillsArray = data.skills.split(',').map(s => s.trim());
      const s1 = skillsArray[0] || 'Especialista';
      const s2 = skillsArray[1] || 'Focado em Resultados';

      const headlines = [
        `${data.role} | ${s1} | ${s2} | ${data.area}`,
        `Especialista em ${data.area} | Ajudando empresas através de ${s1}`,
        `${data.role} Sênior | ${data.years}+ anos de experiência em ${data.area}`
      ];

      const abouts = [
        `Olá, sou ${data.name}. \n\nCom mais de ${data.years} anos de atuação em ${data.area}, construí uma carreira sólida como ${data.role}. \n\nMinha expertise principal envolve ${data.skills}, o que me permite entregar resultados consistentes e inovadores. \n\nRecentemente, destaquei-me por ${data.achievement}. \n\nEstou sempre em busca de novos desafios e conexões que valorizem o crescimento mútuo.`,
        
        `Apaixonado por ${data.area} e focado em resultados.\n\nAtuo como ${data.role} combinando visão estratégica com execução técnica. Minhas principais competências incluem ${s1} e ${s2}.\n\nAo longo da minha trajetória, tive a oportunidade de ${data.achievement}, o que reforçou minha capacidade de resolver problemas complexos.\n\nVamos nos conectar!`
      ];

      setGenerated({ headlines, abouts });
      setStep(2);
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert('Texto copiado para a área de transferência!');
    };

    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-[#0077B5] p-6 flex justify-between items-center text-white">
            <h3 className="font-display font-bold text-xl flex items-center gap-2"><Linkedin size={24}/> Gerador de Perfil</h3>
            <button onClick={() => setIsLinkedInToolOpen(false)} className="hover:bg-white/10 p-1 rounded transition"><X size={24} /></button>
          </div>
          
          <div className="p-8 overflow-y-auto">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800 text-sm">
                  Preencha os dados abaixo para gerar sugestões profissionais. Sem uso de IA, apenas modelos de alta conversão.
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-[#0077B5] outline-none" 
                      value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Seu nome" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Atual/Alvo</label>
                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-[#0077B5] outline-none" 
                      value={data.role} onChange={e => setData({...data, role: e.target.value})} placeholder="Ex: Gerente de Vendas" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área de Atuação</label>
                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-[#0077B5] outline-none" 
                      value={data.area} onChange={e => setData({...data, area: e.target.value})} placeholder="Ex: Tecnologia, Varejo..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anos de Experiência</label>
                    <input type="number" className="w-full p-2 border rounded focus:ring-2 focus:ring-[#0077B5] outline-none" 
                      value={data.years} onChange={e => setData({...data, years: e.target.value})} placeholder="Ex: 5" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">3 Principais Habilidades (separadas por vírgula)</label>
                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-[#0077B5] outline-none" 
                      value={data.skills} onChange={e => setData({...data, skills: e.target.value})} placeholder="Ex: Liderança, Negociação, Excel Avançado" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uma Conquista ou Destaque Principal</label>
                    <textarea rows={2} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#0077B5] outline-none" 
                      value={data.achievement} onChange={e => setData({...data, achievement: e.target.value})} placeholder="Ex: liderei um time de 10 pessoas, aumentei as vendas em 20%..." />
                  </div>
                </div>
                <button onClick={handleGenerate} className="w-full bg-[#0077B5] text-white font-bold py-3 rounded-lg hover:bg-[#006097] transition flex items-center justify-center gap-2">
                  <Sparkles size={20} /> Gerar Perfil
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                 <div>
                    <h4 className="text-[#0077B5] font-bold uppercase text-sm tracking-wide mb-3 flex items-center gap-2"><Briefcase size={16}/> Opções de Título (Headline)</h4>
                    <div className="space-y-3">
                      {generated?.headlines.map((head, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center group hover:border-[#0077B5] transition">
                           <p className="font-medium text-gray-800 text-sm">{head}</p>
                           <button onClick={() => copyToClipboard(head)} className="text-gray-400 hover:text-[#0077B5]" title="Copiar"><Copy size={18}/></button>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div>
                    <h4 className="text-[#0077B5] font-bold uppercase text-sm tracking-wide mb-3 flex items-center gap-2"><FileText size={16}/> Opções de Sobre (About)</h4>
                    <div className="space-y-4">
                      {generated?.abouts.map((about, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded border border-gray-200 group hover:border-[#0077B5] transition relative">
                           <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{about}</p>
                           <button onClick={() => copyToClipboard(about)} className="absolute top-4 right-4 text-gray-400 hover:text-[#0077B5]" title="Copiar"><Copy size={18}/></button>
                        </div>
                      ))}
                    </div>
                 </div>

                 <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-[#0077B5] flex items-center gap-1 mx-auto">
                    <RefreshCw size={14} /> Tentar novamente com outros dados
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Talent Registration Modal Form
  const TalentModal = () => {
    const [formData, setFormData] = useState({ 
      name: '', 
      email: '', 
      phone: '',
      role: '', 
      linkedin: '', 
      externalLink: '',
      summary: '' 
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await onRegisterCandidate(formData);
        setSuccess(true);
        // Clear form after success
        setFormData({ name: '', email: '', phone: '', role: '', linkedin: '', externalLink: '', summary: '' });
      } catch (error) {
        console.error(error);
        alert('Erro ao enviar cadastro. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (success) {
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
             </div>
             <h3 className="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h3>
             <p className="text-gray-600 mb-6">Seu cadastro foi realizado em nosso Banco de Talentos. Entraremos em contato assim que surgir uma oportunidade compatível.</p>
             <Button fullWidth onClick={() => { setSuccess(false); setIsTalentModalOpen(false); }}>Fechar</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-brand-green p-6 flex justify-between items-center text-white">
            <h3 className="font-display font-bold text-xl flex items-center gap-2"><UserCheck size={20}/> Banco de Talentos</h3>
            <button onClick={() => setIsTalentModalOpen(false)} className="hover:bg-white/10 p-1 rounded transition"><X size={24} /></button>
          </div>
          <div className="p-6 overflow-y-auto">
            <p className="text-gray-600 mb-6 text-sm">Preencha o formulário completo abaixo para que possamos conhecer sua trajetória.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Seu nome" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Principal</label>
                  <input required type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área de Interesse/Cargo</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none" 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Ex: Analista Financeiro" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (URL)</label>
                    <input type="url" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none" 
                      value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link do Portfólio/Drive (Opcional)</label>
                    <input type="url" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none" 
                      value={formData.externalLink} onChange={e => setFormData({...formData, externalLink: e.target.value})} placeholder="Link externo para arquivos..." />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo de Qualificações / Mini-CV</label>
                <textarea required rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-sm" 
                  value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} 
                  placeholder="Descreva brevemente sua experiência, formação e principais habilidades..." />
              </div>

              <div className="pt-2">
                <Button fullWidth type="submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Enviar Cadastro'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark">
      {isTalentModalOpen && <TalentModal />}
      {isLinkedInToolOpen && <LinkedInGeneratorModal />}
      
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => scrollToSection('hero')}>
            <Logo className="h-12" variant="full" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#about">Sobre</NavLink>
            <NavLink href="#headhunter">Headhunter</NavLink>
            <NavLink href="#branding">Marca Pessoal</NavLink>
            <NavLink href="#jobs">Vagas</NavLink>
            <Button variant="primary" className="px-6 py-2 text-sm" onClick={() => scrollToSection('contact')}>Fale Comigo</Button>
          </div>
          <button className="md:hidden text-brand-green" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col px-6 py-4">
            <NavLink mobile href="#about" onClick={() => setIsMenuOpen(false)}>Sobre</NavLink>
            <NavLink mobile href="#headhunter" onClick={() => setIsMenuOpen(false)}>Headhunter</NavLink>
            <NavLink mobile href="#branding" onClick={() => setIsMenuOpen(false)}>Marca Pessoal</NavLink>
            <NavLink mobile href="#jobs" onClick={() => setIsMenuOpen(false)}>Vagas</NavLink>
            <div className="mt-4"><Button fullWidth onClick={() => scrollToSection('contact')}>Fale Comigo</Button></div>
          </div>
        )}
      </nav>

      {/* Sections */}
      <section id="hero" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-3xl -z-10"></div>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 fade-in">
            <div className="inline-flex items-center gap-2 bg-brand-yellow/20 px-4 py-1.5 rounded-full text-brand-green font-semibold text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
              Especialista em Carreira e Recrutamento
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-brand-green leading-tight mb-6">
              Conectando <span className="text-brand-yellow">Talentos</span>,<br />
              Construindo <span className="text-brand-yellow">Legados</span>.
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
              Soluções estratégicas de Headhunting para empresas e desenvolvimento de Marca Pessoal para profissionais que desejam se destacar no mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => scrollToSection('headhunter')}>Sou Empresa</Button>
              <Button variant="outline" onClick={() => scrollToSection('jobs')}>Ver Vagas</Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative z-10 bg-brand-green rounded-2xl p-2 rotate-3 shadow-2xl max-w-md mx-auto">
               <div className="bg-white rounded-xl overflow-hidden aspect-[4/5] relative">
                  <img src="https://picsum.photos/800/1000?grayscale" alt="Hevilin Migotto" className="object-cover w-full h-full opacity-90 hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-green/80 to-transparent flex items-end p-8">
                    <div className="text-white"><p className="font-display font-bold text-xl">Hevilin Migotto</p><p className="text-brand-yellow text-sm">Branding & Pessoas</p></div>
                  </div>
               </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-brand-yellow rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-light p-6 rounded-lg text-center transform translate-y-8">
                    <h4 className="text-4xl font-bold text-brand-yellow mb-2">6+</h4>
                    <p className="text-brand-green font-medium">Anos de Experiência</p>
                  </div>
                  <div className="bg-brand-green p-6 rounded-lg text-center text-white">
                    <h4 className="text-4xl font-bold text-brand-yellow mb-2">500+</h4>
                    <p className="font-medium">Profissionais Recolocados</p>
                  </div>
                  <div className="bg-brand-light p-6 rounded-lg text-center col-span-2">
                     <div className="flex justify-center mb-2"><Award className="text-brand-green w-8 h-8" /></div>
                    <p className="text-gray-700 font-medium">Especialista em Gestão de Pessoas</p>
                  </div>
                </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-brand-yellow font-bold uppercase tracking-widest text-sm mb-2">Sobre Mim</h2>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-brand-green mb-6">Mais que recrutamento, estratégia humana.</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">Olá, sou <strong>Hevilin Migotto</strong>. Minha missão é unir o potencial humano às necessidades estratégicas das organizações.</p>
              <div className="flex gap-4"><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-green font-semibold hover:text-brand-yellow transition-colors"><Linkedin size={20} /> Ver LinkedIn</a></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-brand-light relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-green mb-4">Soluções Personalizadas</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div id="headhunter" className="bg-white p-8 rounded-xl shadow-xl border-t-4 border-brand-yellow hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
               <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center mb-6"><Search className="text-brand-green w-8 h-8" /></div>
               <h3 className="font-display text-2xl font-bold text-brand-green mb-4">Headhunter & Recrutamento</h3>
               <p className="text-gray-600 mb-6 flex-grow">Processos seletivos ágeis e assertivos.</p>
               <ul className="space-y-3">{["Mapeamento de perfil", "Hunting ativo", "Entrevistas", "Acompanhamento"].map((f,i) => (<li key={i} className="flex items-start gap-2 text-sm text-gray-700"><div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-brand-yellow" />{f}</li>))}</ul>
            </div>
            <div id="branding" className="bg-white p-8 rounded-xl shadow-xl border-t-4 border-brand-yellow hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full relative overflow-hidden">
               <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center mb-6"><UserCheck className="text-brand-green w-8 h-8" /></div>
               <h3 className="font-display text-2xl font-bold text-brand-green mb-4">Marca Pessoal</h3>
               <p className="text-gray-600 mb-6 flex-grow">Consultoria para profissionais que desejam se posicionar.</p>
               <ul className="space-y-3 mb-8">{["Análise de perfil", "Otimização de LinkedIn", "Networking", "Preparação"].map((f,i) => (<li key={i} className="flex items-start gap-2 text-sm text-gray-700"><div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-brand-yellow" />{f}</li>))}</ul>
               
               <div className="mt-auto pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-brand-green mb-2 uppercase tracking-wide">Ferramenta Gratuita</p>
                  <button onClick={() => setIsLinkedInToolOpen(true)} className="w-full py-2 bg-[#0077B5]/10 text-[#0077B5] rounded font-semibold text-sm hover:bg-[#0077B5] hover:text-white transition flex items-center justify-center gap-2">
                    <Linkedin size={16} /> Gerador de Perfil
                  </button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section id="jobs" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-green mb-4">Vagas em Aberto</h2>
            <p className="text-gray-600">Confira as oportunidades que estamos trabalhando no momento.</p>
          </div>
          <div className="grid gap-6 mb-16">
            {loadingJobs ? (
              <div className="text-center py-10 flex justify-center"><Loader2 className="animate-spin text-brand-green" /></div>
            ) : jobs.length === 0 ? (
               <div className="text-center text-gray-500 py-10 italic">Nenhuma vaga aberta no momento.</div>
            ) : (
              jobs.filter(j => j.active).map((job) => (
                <div key={job.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
                  <div className="flex-grow space-y-3">
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><MapPin size={16} className="text-brand-yellow" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={16} className="text-brand-yellow" /> {job.type}</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-brand-green group-hover:text-brand-yellow transition-colors">{job.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base">{job.description}</p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <Button onClick={() => onApply(job)} className="w-full md:w-auto flex items-center justify-center gap-2">
                       Aplicar agora <ArrowRight size={18} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="relative overflow-hidden bg-brand-green rounded-2xl shadow-xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="relative z-10 px-8 py-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="max-w-xl">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="bg-brand-yellow p-2 rounded-lg"><FileText className="text-brand-green w-6 h-6" /></div>
                   <h3 className="text-2xl font-display font-bold text-white">Banco de Talentos</h3>
                 </div>
                 <p className="text-gray-300 text-lg">Não encontrou a vaga ideal? Cadastre-se em nossa base para futuras oportunidades.</p>
               </div>
               <div className="flex-shrink-0">
                 <button onClick={() => setIsTalentModalOpen(true)} className="flex items-center gap-2 bg-brand-yellow text-brand-green px-8 py-4 rounded-lg font-bold hover:bg-white transition-all shadow-lg transform hover:-translate-y-1">
                   <UserCheck size={20} /> Cadastrar Perfil
                 </button>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-brand-light">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
            <div className="bg-brand-green p-10 md:w-2/5 text-white flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-bl-full"></div>
               <div>
                 <h3 className="text-2xl font-bold font-display mb-6">Vamos Conversar?</h3>
                 <p className="text-brand-light/80 mb-8 text-sm">Estou pronta para atender sua demanda.</p>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4"><Mail size={18} className="text-brand-yellow" /><a href="mailto:hevilinmigotto@gmail.com" className="hover:text-brand-yellow transition">hevilinmigotto@gmail.com</a></div>
                    <div className="flex items-center gap-4"><Linkedin size={18} className="text-brand-yellow" /><a href="#" className="hover:text-brand-yellow transition">Hevilin Migotto</a></div>
                 </div>
               </div>
            </div>
            <div className="p-10 md:w-3/5">
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                {contactStatus === 'success' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-green-50 rounded-lg animate-in fade-in">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h4 className="text-xl font-bold text-green-700 mb-2">Mensagem Enviada!</h4>
                    <p className="text-green-600">Obrigada pelo contato. Responderei o mais breve possível.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Seu Nome</label>
                        <input 
                          type="text" 
                          required 
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20" 
                          placeholder="João Silva"
                          value={contactForm.name}
                          onChange={e => setContactForm({...contactForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                          type="email" 
                          required 
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20" 
                          placeholder="joao@empresa.com" 
                          value={contactForm.email}
                          onChange={e => setContactForm({...contactForm, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                        <textarea 
                          required 
                          rows={4} 
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-brand-green/20" 
                          placeholder="Como posso ajudar?"
                          value={contactForm.message}
                          onChange={e => setContactForm({...contactForm, message: e.target.value})}
                        ></textarea>
                      </div>
                    </div>
                    <Button fullWidth type="submit" disabled={contactStatus === 'submitting'}>
                      {contactStatus === 'submitting' ? <Loader2 className="animate-spin mx-auto"/> : 'Enviar Mensagem'}
                    </Button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-green text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="bg-white p-2 rounded"><Logo className="h-10" variant="full" /></div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-300">
              <a href="#about" className="hover:text-brand-yellow transition">Sobre</a>
              <a href="#headhunter" className="hover:text-brand-yellow transition">Para Empresas</a>
              <a href="#jobs" className="hover:text-brand-yellow transition">Vagas</a>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex justify-between items-center">
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Hevilin Migotto.</p>
            <button onClick={onNavigateToLogin} className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-yellow transition-colors">
              <Lock size={12} /> Área Restrita
            </button>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/5511990072419" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center hover:bg-[#20bd5a]"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('public');
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Admin States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clients, setClients] = useState<ClientCompany[]>([]);
  const [onboardings, setOnboardings] = useState<OnboardingProcess[]>([]);

  // Sub-states for Admin Actions
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!db) {
         setJobs([
            { id: '1', title: 'Gerente Comercial', location: 'São Paulo', type: 'Presencial', description: 'Liderança de equipe comercial.', active: true },
            { id: '2', title: 'Desenvolvedor Frontend', location: 'Remoto', type: 'PJ', description: 'React e Node.js.', active: true },
            { id: '3', title: 'Analista de RH', location: 'Híbrido', type: 'CLT', description: 'Foco em R&S.', active: true },
         ]); 
         setLoadingJobs(false);
         return; 
      }
      try {
        const q = query(collection(db, 'jobs')); // Fetch all jobs for public and admin usage
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
          setJobs(jobsData);
          setLoadingJobs(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching jobs", error);
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch admin data only when logged in
  useEffect(() => {
    if (user && db && view === 'admin') {
      const unsubCandidates = onSnapshot(query(collection(db, 'candidates'), orderBy('createdAt', 'desc')), (snap) => {
        setCandidates(snap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate)));
      });
      const unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      });
      const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
        setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClientCompany)));
      });
      const unsubOnboardings = onSnapshot(collection(db, 'onboardings'), (snap) => {
        setOnboardings(snap.docs.map(d => ({ id: d.id, ...d.data() } as OnboardingProcess)));
      });
      return () => { unsubCandidates(); unsubMessages(); unsubClients(); unsubOnboardings(); };
    }
  }, [user, view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const email = target.email.value;
    const password = target.password.value;
    
    // Bypass for simple testing if DB is down or special admin
    if (email === 'admin@hevilin.com' && password === 'admin' && !auth) {
       setUser({ email: 'admin@hevilin.com' } as User);
       setView('admin');
       return;
    }

    try {
      if (!auth) throw new Error("Firebase não configurado.");
      await signInWithEmailAndPassword(auth, email, password);
      setView('admin');
    } catch (error: any) {
      alert(getErrorMessage(error));
    }
  };

  const handleRegisterCandidate = async (candidate: any) => {
     if (db) {
       await addDoc(collection(db, 'candidates'), { ...candidate, createdAt: serverTimestamp() });
     } else {
       // Mock save
       await new Promise(r => setTimeout(r, 1000));
       console.log("Demo candidate saved", candidate);
     }
  };

  // --- ADMIN ACTIONS ---
  const saveJob = async () => {
    if (!editingJob || !db) return;
    try {
      if (editingJob.id) {
        const { id, ...data } = editingJob;
        await updateDoc(doc(db, 'jobs', id), data);
      } else {
        await addDoc(collection(db, 'jobs'), { ...editingJob, active: true });
      }
      setEditingJob(null);
    } catch(e) { console.error(e); alert('Erro ao salvar vaga'); }
  };

  const deleteJob = async (id: string) => {
    if(!db || !window.confirm('Tem certeza?')) return;
    await deleteDoc(doc(db, 'jobs', id));
  };

  if (view === 'public') {
    return (
      <PublicSite 
        jobs={jobs} 
        loadingJobs={loadingJobs}
        onNavigateToLogin={() => setView('login')}
        onApply={(job) => {
           const msg = `Olá! Gostaria de me candidatar para a vaga: ${job.title}`;
           window.open(`https://wa.me/5511990072419?text=${encodeURIComponent(msg)}`, '_blank');
        }}
        onRegisterCandidate={handleRegisterCandidate}
      />
    );
  }

  if (view === 'login') {
    return (
       <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-center mb-6"><Logo /></div>
            <h2 className="text-xl font-bold text-center text-brand-green mb-6">Área Restrita</h2>
            <form onSubmit={handleLogin} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                 <input name="email" type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                 <input name="password" type="password" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" />
               </div>
               <Button fullWidth type="submit">Entrar</Button>
            </form>
            <div className="mt-6 text-center">
               <button onClick={() => setView('public')} className="text-sm text-gray-500 hover:text-brand-green">Voltar ao site</button>
            </div>
         </div>
       </div>
    );
  }

  // --- ADMIN DASHBOARD RENDER ---
  if (view === 'admin') {
     const tabs = [
       { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
       { id: 'jobs', label: 'Vagas', icon: Briefcase },
       { id: 'candidates', label: 'Talentos', icon: Users },
       { id: 'messages', label: 'Mensagens', icon: MessageSquare },
       { id: 'clients', label: 'Clientes', icon: Building },
       { id: 'onboarding', label: 'Admissão', icon: FileCheck },
     ];

     return (
       <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-brand-green text-white flex-shrink-0">
             <div className="p-6 border-b border-white/10">
               <Logo variant="full" className="h-10 text-white invert grayscale brightness-200" />
             </div>
             <nav className="p-4 space-y-2">
               {tabs.map(t => (
                 <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${activeTab === t.id ? 'bg-brand-yellow text-brand-green font-bold' : 'hover:bg-white/10'}`}>
                    <t.icon size={20} /> {t.label}
                 </button>
               ))}
             </nav>
             <div className="p-4 mt-auto">
               <button onClick={() => { if(auth) signOut(auth); setView('login'); setUser(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-white/10 rounded">
                 <LogOut size={20} /> Sair
               </button>
             </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow p-6 md:p-10 overflow-y-auto">
             <header className="flex justify-between items-center mb-8">
               <h1 className="text-2xl font-bold text-gray-800">{tabs.find(t=>t.id===activeTab)?.label}</h1>
               <div className="text-sm text-gray-500">Usuário: {user?.email}</div>
             </header>

             {/* DASHBOARD TAB */}
             {activeTab === 'dashboard' && (
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                       <div className="bg-blue-100 p-3 rounded-lg"><Briefcase className="text-blue-600"/></div>
                       <span className="text-2xl font-bold">{jobs.filter(j=>j.active).length}</span>
                    </div>
                    <p className="text-gray-600">Vagas Ativas</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                       <div className="bg-purple-100 p-3 rounded-lg"><Users className="text-purple-600"/></div>
                       <span className="text-2xl font-bold">{candidates.length}</span>
                    </div>
                    <p className="text-gray-600">Talentos no Banco</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                       <div className="bg-green-100 p-3 rounded-lg"><MessageSquare className="text-green-600"/></div>
                       <span className="text-2xl font-bold">{messages.length}</span>
                    </div>
                    <p className="text-gray-600">Mensagens Recebidas</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                       <div className="bg-yellow-100 p-3 rounded-lg"><Building className="text-yellow-600"/></div>
                       <span className="text-2xl font-bold">{clients.length}</span>
                    </div>
                    <p className="text-gray-600">Clientes Parceiros</p>
                 </div>
               </div>
             )}

             {/* JOBS TAB */}
             {activeTab === 'jobs' && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-6 border-b border-gray-100 flex justify-between">
                    <h2 className="font-bold text-lg">Gerenciar Vagas</h2>
                    <Button className="py-2 px-4 text-sm" onClick={() => setEditingJob({ title:'', location:'', type:'', description:'', active: true })}>
                       <Plus size={16} className="mr-2"/> Nova Vaga
                    </Button>
                 </div>
                 {editingJob && (
                   <div className="p-6 bg-gray-50 border-b border-gray-100">
                      <h3 className="font-bold mb-4 text-sm uppercase text-brand-green">{editingJob.id ? 'Editar' : 'Criar'} Vaga</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                         <input placeholder="Título" className="p-2 border rounded" value={editingJob.title} onChange={e=>setEditingJob({...editingJob, title:e.target.value})} />
                         <input placeholder="Local" className="p-2 border rounded" value={editingJob.location} onChange={e=>setEditingJob({...editingJob, location:e.target.value})} />
                         <input placeholder="Tipo (CLT/PJ)" className="p-2 border rounded" value={editingJob.type} onChange={e=>setEditingJob({...editingJob, type:e.target.value})} />
                         <textarea placeholder="Descrição" className="p-2 border rounded col-span-2" value={editingJob.description} onChange={e=>setEditingJob({...editingJob, description:e.target.value})} />
                         <div className="flex items-center gap-2">
                            <input type="checkbox" checked={editingJob.active} onChange={e=>setEditingJob({...editingJob, active:e.target.checked})} /> <label>Ativa no site?</label>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="py-1 px-4 text-sm" onClick={saveJob}>Salvar</Button>
                        <Button variant="outline" className="py-1 px-4 text-sm" onClick={() => setEditingJob(null)}>Cancelar</Button>
                      </div>
                   </div>
                 )}
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-sm text-gray-600 uppercase">
                     <tr>
                       <th className="p-4">Cargo</th>
                       <th className="p-4">Local</th>
                       <th className="p-4">Status</th>
                       <th className="p-4 text-right">Ações</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {jobs.map(job => (
                       <tr key={job.id} className="hover:bg-gray-50">
                         <td className="p-4 font-medium">{job.title}</td>
                         <td className="p-4 text-gray-600">{job.location}</td>
                         <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${job.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{job.active ? 'Ativa' : 'Inativa'}</span></td>
                         <td className="p-4 text-right space-x-2">
                           <button onClick={() => setEditingJob(job)} className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                           <button onClick={() => deleteJob(job.id)} className="text-red-600 hover:text-red-800 text-sm">Excluir</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}

             {/* CANDIDATES TAB */}
             {activeTab === 'candidates' && (
               <div className="space-y-6">
                 {/* Modal to view candidate details */}
                 {viewCandidate && (
                   <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
                         <button onClick={() => setViewCandidate(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                         <h3 className="text-2xl font-bold text-brand-green mb-1">{viewCandidate.name}</h3>
                         <p className="text-gray-500 mb-6">{viewCandidate.role}</p>
                         
                         <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2 text-sm">
                              <p className="flex items-center gap-2 text-gray-700"><Mail size={16}/> {viewCandidate.email}</p>
                              <p className="flex items-center gap-2 text-gray-700"><Phone size={16}/> {viewCandidate.phone}</p>
                              {viewCandidate.linkedin && <p className="flex items-center gap-2 text-blue-600"><Linkedin size={16}/> <a href={viewCandidate.linkedin} target="_blank" rel="noreferrer">Perfil LinkedIn</a></p>}
                              {viewCandidate.externalLink && <p className="flex items-center gap-2 text-brand-yellow"><LinkIcon size={16}/> <a href={viewCandidate.externalLink} target="_blank" rel="noreferrer">Portfólio/Drive</a></p>}
                            </div>
                         </div>
                         <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                           <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wide">Resumo Profissional</h4>
                           <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{viewCandidate.summary}</p>
                         </div>
                         <div className="mt-6 flex justify-end">
                            <Button onClick={() => setViewCandidate(null)}>Fechar</Button>
                         </div>
                      </div>
                   </div>
                 )}

                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-6 border-b border-gray-100"><h2 className="font-bold text-lg">Banco de Talentos</h2></div>
                   <table className="w-full text-left">
                     <thead className="bg-gray-50 text-sm text-gray-600 uppercase">
                       <tr>
                         <th className="p-4">Nome</th>
                         <th className="p-4">Cargo</th>
                         <th className="p-4">Contato</th>
                         <th className="p-4 text-right">Detalhes</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {candidates.length === 0 ? (
                         <tr><td colSpan={4} className="p-6 text-center text-gray-500">Nenhum candidato cadastrado.</td></tr>
                       ) : (
                         candidates.map(c => (
                           <tr key={c.id} className="hover:bg-gray-50">
                             <td className="p-4 font-medium">{c.name}</td>
                             <td className="p-4 text-gray-600">{c.role}</td>
                             <td className="p-4 text-sm text-gray-500">{c.email}<br/>{c.phone}</td>
                             <td className="p-4 text-right">
                               <button onClick={() => setViewCandidate(c)} className="flex items-center gap-1 ml-auto text-brand-green hover:underline">
                                 <Eye size={16} /> Ver Perfil
                               </button>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}

             {/* MESSAGES TAB */}
             {activeTab === 'messages' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100"><h2 className="font-bold text-lg">Mensagens Recebidas</h2></div>
                  <div className="divide-y divide-gray-100">
                     {messages.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">Nenhuma mensagem recebida ainda.</div>
                     ) : (
                        messages.map(m => (
                           <div key={m.id} className="p-6 hover:bg-gray-50 transition">
                              <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-gray-800">{m.name}</h4>
                                 <span className="text-xs text-gray-400">
                                   {m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : 'Hoje'}
                                 </span>
                              </div>
                              <p className="text-sm text-brand-green font-medium mb-2">{m.email}</p>
                              <p className="text-gray-600 text-sm whitespace-pre-wrap">{m.message}</p>
                           </div>
                        ))
                     )}
                  </div>
                </div>
             )}
             
             {/* CLIENTS & ONBOARDING PLACEHOLDERS (Fully implementable with same pattern) */}
             {(activeTab === 'clients' || activeTab === 'onboarding') && (
               <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Em Breve</h3>
                  <p className="text-gray-600">O módulo de {activeTab === 'clients' ? 'Clientes' : 'Admissão'} será habilitado na próxima atualização.</p>
               </div>
             )}

          </main>
       </div>
     );
  }

  return null;
};

export default App;