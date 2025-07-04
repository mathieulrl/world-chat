
import { useState } from "react";
import { Plus, DollarSign, Download, Upload, X } from "lucide-react";

interface MoneyActionsProps {
  onSendMoney: (amount: number) => void;
  onRequestMoney: (amount: number) => void;
}

const MoneyActions = ({ onSendMoney, onRequestMoney }: MoneyActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [amount, setAmount] = useState("");

  const handleSendMoney = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSendMoney(numAmount);
      setAmount("");
      setShowSendForm(false);
      setIsOpen(false);
    }
  };

  const handleRequestMoney = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onRequestMoney(numAmount);
      setAmount("");
      setShowRequestForm(false);
      setIsOpen(false);
    }
  };

  const resetForms = () => {
    setShowSendForm(false);
    setShowRequestForm(false);
    setAmount("");
  };

  if (showSendForm) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Send Money</h3>
          <button
            onClick={() => {
              resetForms();
              setIsOpen(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
          <button
            onClick={handleSendMoney}
            disabled={!amount || parseFloat(amount) <= 0}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  if (showRequestForm) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Request Money</h3>
          <button
            onClick={() => {
              resetForms();
              setIsOpen(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
          <button
            onClick={handleRequestMoney}
            disabled={!amount || parseFloat(amount) <= 0}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
          >
            Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[140px]">
          <button
            onClick={() => setShowSendForm(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
          >
            <Upload className="h-4 w-4 text-green-500" />
            <span className="text-sm">Send Money</span>
          </button>
          <button
            onClick={() => setShowRequestForm(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
          >
            <Download className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Request Money</span>
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors duration-200 flex items-center justify-center min-w-[40px]"
      >
        <Plus className={`h-4 w-4 md:h-5 md:w-5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
};

export default MoneyActions;
