import React ,{ useEffect, useState , useContext}from 'react'
import './Transaction.css'
import { MessageContext } from '../../components/shared/MessageContext';
import apiClient from '../../apiClient';

export default function Transaction() {



  interface Wallet {
    id?: number;
    account_number?: string;
    balance?: string;
    ledger_balance?: string;
    previous_balance?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
  }

  interface Transaction {
    transaction_id?: number;
    transaction_type?: string;
    amount?: string;
    status?: string;
    created_at?:string;
  }

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fundAmount, setFundAmount] = useState<number | string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>('');
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messageContext = useContext(MessageContext);

  // Ensure messageContext is available
  if (!messageContext) {
    throw new Error('Login must be used within a MessageProvider');
  }

  const { displayError, displaySuccess } = messageContext;

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(date);
  };


  useEffect(() => {
  
    (async () => {

      const response = await apiClient.get('wallet/details');
    
      const content = response.data;

      setWallet(content); 

    })();
  }, []); 


  useEffect(() => {
  
    (async () => {
     
      const response = await apiClient.get('fetch/transactions');
      
      const content = response.data;

      if(content.status){
        setTransactions(content.transactions); 
      }else{
        setTransactions([]); 
      }

     
    })();
  }, []); 



  const handleFund = async () => {
    setError(null)
    if (fundAmount <= 0) {
      setError('Amount to fund must be greater than zero.');
      return;
    }
    setError(null);
  
    const response = await apiClient.post('fund/wallet',{ amount : fundAmount,});
    const content = response.data;
  
    if(content.status !== 'true') {
      displayError('Failed to withdraw fund');
    }
    
    setIsFundModalOpen(false);

    setTimeout(() => {
      window.location.reload();
    }, 3000);

    displaySuccess(content?.message)
  };

  const handleWithdraw = async () => {
    setError(null)
    if (withdrawAmount <= 0) {
      setError('Amount to withdraw must be greater than zero.');
      return;
    }
    if (withdrawAmount > (wallet?.balance || 0)) {
      setError('Insufficient funds to withdraw.');
      return;
    }

    setError(null);
  
    const response = await apiClient.post('withdraw/fund',{ amount : withdrawAmount,});
    const content = response.data;

    if(content.status !== 'true') {
        displayError('Failed to withdraw fund');
      }
    
     displaySuccess(content?.message)

     setTimeout(() => {
      window.location.reload();
    }, 3000);

    setIsWithdrawModalOpen(false);
  };


  return (
    <div>
      <div className="container">
        <div className="wallet_section">
            <div className="wallet_box">
              <h2>Wallet Details</h2>
              <div className="details">
                  <p>Account Number : {wallet?.account_number} </p>
                  <p>Account Balance : {wallet?.balance}</p>
                  <p>Ledger Balance : {wallet?.ledger_balance}</p>
                  <p>Account Status : {wallet?.status}</p>
              </div>
              <div className='withdrawals_btn'>
              <button onClick={() => setIsFundModalOpen(true)}>Fund Wallet</button>
              <button onClick={() => setIsWithdrawModalOpen(true)}>Withdraw Fund</button>
              </div>
            </div>
        </div>
               
                {isFundModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Fund Wallet</h3>
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Enter amount to fund"
              />
              {error && <p className="error">{error}</p>}
              <div className="withdrawal_btn">
                <button onClick={handleFund}>Fund</button>
                <button onClick={() => setIsFundModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {isWithdrawModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Withdraw Funds</h3>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
              />
              {error && <p className="error">{error}</p>}
              <div className="withdrawal_btn">
              <button onClick={handleWithdraw}>Withdraw</button>
              <button onClick={() => setIsWithdrawModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
         <div className="table_container">
         <table>
            <tr>
            <th>#</th>
            <th>Transaction Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Transaction Date</th>
            </tr>
            {transactions.map((transaction, index) => (
            <tr key={transaction.transaction_id}>
              <td>{index + 1}</td>
              <td>{transaction.transaction_type}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.status}</td>
              <td>{formatDate(transaction.created_at)}</td>
            </tr>
            ))}
           
         </table>
         </div>
      </div>
    </div>
  )
}
