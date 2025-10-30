import { useToken } from "../hooks/useToken";
import { useEthers } from "../hooks/useEthers";
import "../styles/DepositModal.css"

const DepositModal = ({ poolName }) => {
  const { provider, account } = useEthers();
  const { balance, approve, loading } = useToken("USDT", provider, account);

  return (
    <div>
      <p>Your USDT balance: {balance}</p>
      <button
        disabled={loading}
        onClick={() => approve("0xStakingContractAddress", "100")}
      >
        Approve 100 USDT
      </button>
    </div>
  );
};

export default DepositModal;