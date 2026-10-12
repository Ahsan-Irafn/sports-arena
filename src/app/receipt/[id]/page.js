import { Suspense } from "react";
import ReceiptClient from "./ReceiptClient";

export default async function ReceiptPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Receipt...</div>}>
      <ReceiptClient id={id} />
    </Suspense>
  );
}
