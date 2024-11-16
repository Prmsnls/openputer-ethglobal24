interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }
  
  export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-50 bg-white border-[3px] border-black rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
          {children}
        </div>
      </div>
    );
  };