"use client";
import { useState } from "react";
import { privateTravelFund } from "../../lib/privateTravelFund";

type Account = {
  name: string;
  id: string;
};

type ContributionProof = {
  contributor: string;
  accountId: string;
  transactionId: string;
  timestamp: string;
  verified: boolean;
};

type Step = {
  id: string;
  title: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  details?: string;
};

type FundState = {
  totalAmount: string;
  contributorCount: number;
  allParticipated: boolean;
  fairContributions: boolean;
  privacyPreserved: boolean;
};

export default function Home() {
  const [isCreatingFund, setIsCreatingFund] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contributionProofs, setContributionProofs] = useState<ContributionProof[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [fundState, setFundState] = useState<FundState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStep = (stepId: string, title: string, status: 'pending' | 'loading' | 'completed' | 'error', details?: string) => {
    setSteps(prev => {
      const existingStep = prev.find(s => s.id === stepId);
      if (existingStep) {
        return prev.map(s =>
          s.id === stepId ? { ...s, title, status, details } : s
        );
      }
      return [...prev, { id: stepId, title, status, details }];
    });
  };

  const setAccount = (name: string, accountId: string) => {
    setAccounts(prev => {
      const existingAccount = prev.find(a => a.name === name);
      if (existingAccount) {
        return prev.map(a =>
          a.name === name ? { ...a, id: accountId } : a
        );
      }
      return [...prev, { name, id: accountId }];
    });
  };

  const addContributionProof = (proof: ContributionProof) => {
    setContributionProofs(prev => [...prev, proof]);
  };

  const updateFundState = (state: FundState) => {
    setFundState(state);
  };

  const handleSetError = (error: string) => {
    setError(error);
  };

  const handleCreateTravelFund = async () => {
    setHasStarted(true);
    setIsCreatingFund(true);
    setError(null);
    setSteps([]);
    setAccounts([]);
    setContributionProofs([]);
    setFundState(null);

    await privateTravelFund({
      updateStep,
      setAccount,
      addContributionProof,
      updateFundState,
      setError: handleSetError
    });

    setIsCreatingFund(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'loading': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!hasStarted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">✈️ Private Travel Fund Splitter</h1>
          <p className="mb-6 max-w-xl mx-auto">
            Simulate three contributors anonymously contributing to a travel fund using Miden zero-knowledge proofs.
          </p>
          <button
            onClick={handleCreateTravelFund}
            className="px-6 py-3 text-lg bg-orange-600 hover:bg-orange-500 rounded-xl cursor-pointer disabled:opacity-60"
            disabled={isCreatingFund}
          >
            {isCreatingFund ? "Processing..." : "Start Private Travel Fund"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-20  flex items-center justify-center bg-black text-white">
      <div className="w-[90%] mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">✈️ Private Travel Fund Splitter</h1>
          <p className="mb-6 max-w-xl mx-auto">
            Simulate three contributors anonymously contributing to a travel fund using Miden zero-knowledge proofs.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-xl p-4 mb-6 mx-auto max-w-3xl">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 ">
          {/* Accounts Card */}
          <div className="bg-gray-800/20 border border-gray-600 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Accounts
            </h3>
            <div className="space-y-2">
              {accounts.map(account => (
                <div key={account.name} className="bg-gray-700/30 p-2 rounded-lg">
                  <div className="font-medium text-sm">{account.name}</div>
                  <div className="text-xs text-gray-400 truncate" title={account.id}>
                    {account.id.slice(0, 8)}...{account.id.slice(-4)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contributions Card */}
          <div className="bg-gray-800/20 border border-gray-600 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              Contributions
            </h3>
            <div className="space-y-2">
              {contributionProofs.length > 0 ? (
                contributionProofs.map((proof, index) => (
                  <div key={index} className="bg-gray-700/30 p-2 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{proof.contributor}</span>
                      {proof.verified ? (
                        <span className="text-xs bg-green-900/50 text-green-300 px-1.5 py-0.5 rounded">Verified</span>
                      ) : (
                        <span className="text-xs bg-yellow-900/50 text-yellow-300 px-1.5 py-0.5 rounded">Pending</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(proof.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-1" title={proof.transactionId}>
                      TX: {proof.transactionId.slice(0, 6)}...
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm text-center py-3">
                  No contributions yet
                </div>
              )}
            </div>
          </div>

          {/* Fund Status Card */}
          <div className="bg-gray-800/20 border border-gray-600 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              Fund Status
            </h3>
            {fundState ? (
              <div className="space-y-3">
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <div className="text-xl font-bold text-center">
                    ${fundState.totalAmount}
                  </div>
                  <div className="text-center text-xs text-gray-400 mt-1">
                    Total Contributions
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${fundState.allParticipated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">All participated: {fundState.allParticipated ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${fundState.fairContributions ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Fair contributions: {fundState.fairContributions ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${fundState.privacyPreserved ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Privacy preserved: {fundState.privacyPreserved ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm text-center py-3">
                Fund not yet created
              </div>
            )}
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-gray-800/20 border border-gray-600 rounded-xl p-4 mt-10 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-3">Process Steps</h3>
          <div className="space-y-2">
            {steps.length > 0 ? (
              steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getStatusColor(step.status)}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm">{step.title}</span>
                      <span className="text-xs text-gray-400 capitalize">{step.status}</span>
                    </div>
                    {step.details && (
                      <div className="text-xs text-gray-400 mt-0.5">{step.details}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-3">
                Process not started
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleCreateTravelFund}
                disabled={isCreatingFund}
                className={`px-6 py-2.5 text-base md:text-lg cursor-pointer bg-transparent border-2 ${isCreatingFund
                    ? 'border-gray-600 text-gray-400'
                    : 'border-orange-600 text-white hover:bg-orange-600 hover:text-white'
                  } rounded-lg transition-all w-full max-w-sm`}
              >
                {isCreatingFund ? "Processing..." : "Start Another Private Travel Fund"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

