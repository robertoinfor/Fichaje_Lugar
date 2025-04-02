import { Mail, Phone, Globe } from 'lucide-react';
import './Footer.css';
import { useIonToast } from '@ionic/react';


const Footer: React.FC = () => {
  const [present] = useIonToast();
  const handleCopyPhone = () => {
    navigator.clipboard.writeText("(+34) 660 079 198")
      .then(() => {
        present({
          message: 'Teléfono copiado al portapapeles 📋',
          duration: 1500,
          position: 'bottom',
          color: 'success'
        });
      })
      .catch(() => {
        present({
          message: 'No se pudo copiar',
          duration: 1500,
          color: 'danger'
        });
      });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <span className="footer-title">CONTACTO</span>
        <div className="footer-divider" />
        <div className="footer-items">
          <div className="footer-item">
            <div className="footer-icon"><Mail size={18} /></div>
            <a href="mailto:info@lugargestioncultural.com">info@lugargestioncultural.com</a>
          </div>
          <div className="footer-item" onClick={handleCopyPhone} style={{ cursor: 'pointer' }}>
            <div className="footer-icon"><Phone size={18} /></div>
            <span>(+34) 660 079 198</span>
          </div>
          <div className="footer-item">
            <div className="footer-icon"><Globe size={18} /></div>
            <a href="https://lugargestioncultural.com/" target="_blank" rel="noreferrer">
              https://lugargestioncultural.com/
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
