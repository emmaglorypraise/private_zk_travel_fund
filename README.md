This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


// lib/travelFund.ts

export async function contributeAllToTravelFund(): Promise<void> {
  if (typeof window === "undefined") return;

  const {
    WebClient,
    AccountStorageMode,
    NoteType,
    Program,
  } = await import("@demox-labs/miden-sdk");

  const nodeEndpoint = "https://rpc.testnet.miden.io:443";
  const client = await WebClient.createClient(nodeEndpoint);
  await client.syncState();

  const minShare = 100;
  const contributionAmount = 150;
  let totalFund = 0;

  // 1. Create contributor wallets
  const alice = await client.newWallet(AccountStorageMode.public(), true);
  const bob = await client.newWallet(AccountStorageMode.public(), true);
  const carol = await client.newWallet(AccountStorageMode.public(), true);

  const contributors = [alice, bob, carol];
  console.log("Contributors created:", contributors.map(c => c.id().toString()));

  // 2. Deploy faucet
  const faucet = await client.newFaucet(
    AccountStorageMode.public(),
    false,
    "TRVL",
    8,
    BigInt(1_000_000)
  );
  await client.syncState();
  console.log("Faucet deployed:", faucet.id().toString());

  // 3. Mint and consume for each contributor
  for (const contributor of contributors) {
    await client.fetchAndCacheAccountAuthByAccountId(faucet.id());
    await client.syncState();

    const mintRequest = client.newMintTransactionRequest(
      contributor.id(),
      faucet.id(),
      NoteType.Public,
      BigInt(contributionAmount)
    );
    const mintTx = await client.newTransaction(faucet.id(), mintRequest);
    await client.submitTransaction(mintTx);
    await new Promise(res => setTimeout(res, 10000));

    const notes = await client.getConsumableNotes(contributor.id());
    const noteIds = notes.map((n) => n.inputNoteRecord().id().toString());

    const consumeRequest = client.newConsumeTransactionRequest(noteIds);
    const consumeTx = await client.newTransaction(contributor.id(), consumeRequest);
    await client.submitTransaction(consumeTx);
    console.log("Consumed notes for:", contributor.id().toString());
  }

  // 4. Generate ZK proof for each contributor
  const script = `
    INPUT amount
    CONST ${minShare}
    GE
    ASSERT
  `;

  const program = await Program.fromText(script, "min-contribution-check");

  for (const contributor of contributors) {
    const proof = await client.newTransactionProof(contributor.id(), program, [contributionAmount]);
    const verified = await client.verifyProof(proof, program, [minShare]);

    if (verified) {
      totalFund += contributionAmount;
      console.log(`✅ ${contributor.id().toString()} contribution accepted.`);
    } else {
      console.log(`❌ ${contributor.id().toString()} contribution failed.`);
    }
  }

  console.log("🏁 Final Simulated Travel Fund Total:", totalFund);
}
