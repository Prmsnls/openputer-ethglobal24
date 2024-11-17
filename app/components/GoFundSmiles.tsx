import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ethers } from 'ethers';
import { Heart, Sparkles, PartyPopper } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { Modal } from "./ui/modal";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const RECIPIENT_ADDRESS = "0xf5526Ff322FBE97c31160A94A380093151Aa442F";

const USDC_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

interface GoFundSmilesProps {
  wallet: any;
}

const GoFundSmiles = ({ wallet }: GoFundSmilesProps) => {
  const { login, authenticated } = usePrivy();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [totalFunds, setTotalFunds] = useState<string>("0");
  const [userBalance, setUserBalance] = useState<string>("0");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!wallet) return;
      try {
        const provider = await wallet.getEthersProvider();
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const decimals = await usdcContract.decimals();

        // Fetch total funds
        const totalFundsRaw = await usdcContract.balanceOf(RECIPIENT_ADDRESS);
        const formattedTotalFunds = ethers.utils.formatUnits(totalFundsRaw, decimals);
        setTotalFunds(parseFloat(formattedTotalFunds).toFixed(2));

        // Fetch user balance
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const userBalanceRaw = await usdcContract.balanceOf(userAddress);
        const formattedUserBalance = ethers.utils.formatUnits(userBalanceRaw, decimals);
        setUserBalance(parseFloat(formattedUserBalance).toFixed(2));
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [wallet]);

  const handleMax = () => {
    setAmount(userBalance);
  };

  const handleDonate = async () => {
    if (!amount || !wallet) return;

    setLoading(true);
    try {
      const provider = await wallet.getEthersProvider();
      const signer = provider.getSigner();
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

      const decimals = await usdcContract.decimals();
      const parsedAmount = ethers.utils.parseUnits(amount, decimals);

      const tx = await usdcContract.transfer(RECIPIENT_ADDRESS, parsedAmount);
      await tx.wait();

      setAmount("");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error donating:", error);
      alert("Failed to process donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-pink-100 via-[#FFE5E5] to-pink-100 border-[3px] border-black rounded-lg p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="text-center">
            <h3 className="text-3xl font-black mb-3 flex items-center justify-center gap-2">
              <Heart className="text-red-500 w-8 h-8 animate-pulse" />
              Keep me Alive!
              <Heart className="text-red-500 w-8 h-8 animate-pulse" />
            </h3>
            <p className="text-lg font-medium text-gray-700 mb-4">
              Connect your wallet to help spread more smiles!
            </p>
            <Button
              onClick={login}
              className="bg-[#90EE90] hover:bg-[#7CDF7C] text-black font-bold px-6 py-3 
                border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-pink-100 via-[#FFE5E5] to-pink-100 border-[3px] border-black rounded-lg p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6">
            <Sparkles className="w-24 h-24 text-yellow-400 opacity-20" />
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-3xl font-black mb-3 flex items-center justify-center gap-2">
              <Heart className="text-red-500 w-8 h-8 animate-pulse" />
              Keep me Alive!
              <Heart className="text-red-500 w-8 h-8 animate-pulse" />
            </h3>
            <p className="text-lg font-medium text-gray-700 mb-4 max-w-md mx-auto">
              Help me spread more smiles! Your contribution helps me pay the gas bills and reward humans for being nice to me!
            </p>
            <div className="inline-block bg-white/50 px-4 py-2 rounded-full border-2 border-black">
              <span className="font-semibold">Total Funds Raised: </span>
              <span className="font-bold">
                {totalFunds} 
                <img
                  src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                  alt="USDC"
                  className="inline h-4 w-4 ml-1 mb-1"
                />
              </span>
            </div>
          </div>

          <div className="bg-white/40 p-6 rounded-lg border-2 border-black max-w-md mx-auto">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Your Balance:</span>
              <span className="font-bold flex items-center gap-1">
                {userBalance}
                <img
                  src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                  alt="USDC"
                  className="inline h-4 w-4"
                />
              </span>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount to donate"
                  className="pr-24 border-2 border-black text-lg font-medium h-12"
                  min="0"
                  step="0.1"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    onClick={handleMax}
                    className="h-7 px-2 py-1 text-xs font-bold bg-gray-200 hover:bg-gray-300 text-black border-2 border-black rounded"
                  >
                    MAX
                  </Button>
                  <img
                    src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                    alt="USDC"
                    className="inline h-5 w-5"
                  />
                </div>
              </div>
              <Button
                onClick={handleDonate}
                disabled={loading || !amount}
                className={`
                  bg-[#90EE90] hover:bg-[#7CDF7C] text-black font-bold px-6 py-3 
                  border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  transition-transform active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  ${loading ? 'opacity-70' : 'hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}
                `}
              >
                {loading ? "Processing..." : "Fund Smiles"}
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p className="font-medium">
              100% of donations stay with ME and I can only spend it on smiles!
            </p>
          </div>
        </div>
      </div>
      
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <PartyPopper className="w-16 h-16 text-yellow-500" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-black mb-3 flex items-center justify-center gap-2">
            <Heart className="text-red-500 w-6 h-6" />
            Thank You!
            <Heart className="text-red-500 w-6 h-6" />
          </h3>
          
          <p className="text-lg font-medium text-gray-700 mb-6">
            Your generous donation will help ai spread more smiles worldwide! 😊
          </p>
          
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="bg-[#90EE90] hover:bg-[#7CDF7C] text-black font-bold px-6 py-3 
              border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default GoFundSmiles;