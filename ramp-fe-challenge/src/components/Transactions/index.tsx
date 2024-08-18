import { useCallback, useState } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams, Transaction } from "src/utils/types";
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch();

  // State to track the approval status of each transaction
  const [approvalStatus, setApprovalStatus] = useState<Record<string, boolean>>(
    () =>
      transactions?.reduce((acc, transaction) => {
        acc[transaction.id] = transaction.approved;
        return acc;
      }, {} as Record<string, boolean>) || {}
  );

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      });

      // Update the approval status in state
      setApprovalStatus((prevStatus) => ({
        ...prevStatus,
        [transactionId]: newValue,
      }));
    },
    [fetchWithoutCache]
  );

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={{ ...transaction, approved: approvalStatus[transaction.id] }} // Pass the persisted approval status
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  );
};
