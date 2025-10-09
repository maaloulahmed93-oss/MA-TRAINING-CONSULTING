import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { addSubscriber, unsubscribeByEmail } from '../services/newsletterService';

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [unEmail, setUnEmail] = useState('');
  const [unDone, setUnDone] = useState<null | 'ok' | 'fail'>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    try {
      // Try API first
      const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("✅ Newsletter subscription via API:", email);
        setSubmitted(true);
        setEmail("");
      } else {
        throw new Error(result.message || 'Erreur API');
      }
    } catch (error) {
      console.log("⚠️ API failed, using localStorage fallback:", error);
      // Fallback to localStorage
      addSubscriber(email.trim());
      console.log("Newsletter subscription via localStorage:", email);
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="newsletter-container">
            <div className="newsletter-icon">
              <Mail className="w-12 h-12 text-blue-400" />
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Restez <span className="text-gradient">informé</span>
            </h2>

            <p className="font-sans text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              Recevez nos dernières actualités, formations et conseils
              directement dans votre boîte mail
            </p>

            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="newsletter-input-container">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="newsletter-input"
                  aria-describedby="newsletter-email-help"
                  required
                />
                <button type="submit" className="newsletter-button">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <p
                id="newsletter-email-help"
                className="text-xs text-gray-400 mt-2"
              >
                Entrez votre adresse email pour recevoir nos actualités. Nous
                n'envoyons pas de spam.
              </p>
              {submitted && (
                <p className="text-sm text-green-300 mt-3">Merci ! Votre inscription a été prise en compte.</p>
              )}
            </form>

            <p className="text-sm text-gray-400 mt-4">
              En vous inscrivant, vous acceptez de recevoir nos communications.
              {' '}<span className="text-gray-200">Vous pouvez vous désinscrire à tout moment.</span>
            </p>

            {/* Inline unsubscribe form */}
            <div className="mt-3 max-w-md mx-auto">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!unEmail.trim()) return;
                  
                  try {
                    // Try API first
                    const response = await fetch('http://localhost:3001/api/newsletter/unsubscribe', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ email: unEmail.trim() })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      console.log("✅ Newsletter unsubscribe via API:", unEmail);
                      setUnDone('ok');
                      setUnEmail('');
                    } else {
                      setUnDone('fail');
                    }
                  } catch (error) {
                    console.log("⚠️ API failed, using localStorage fallback:", error);
                    // Fallback to localStorage
                    const ok = unsubscribeByEmail(unEmail.trim());
                    setUnDone(ok ? 'ok' : 'fail');
                    if (ok) setUnEmail('');
                  }
                }}
                className="flex gap-2 justify-center"
                aria-labelledby="unsubscribe-label"
              >
                <label id="unsubscribe-label" className="sr-only">Se désinscrire</label>
                <input
                  type="email"
                  value={unEmail}
                  onChange={(e) => setUnEmail(e.target.value)}
                  placeholder="Entrez votre email pour vous désinscrire"
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 w-full"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  Se désinscrire
                </button>
              </form>
              {unDone === 'ok' && (
                <p className="text-xs text-green-300 mt-2 text-center">Votre adresse a été désinscrite avec succès.</p>
              )}
              {unDone === 'fail' && (
                <p className="text-xs text-yellow-300 mt-2 text-center">Adresse introuvable dans la liste.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
