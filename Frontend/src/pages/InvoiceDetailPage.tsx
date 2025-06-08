import { useEffect, useState } from "react";
import { getInvoice } from "../requests/InvoiceRequest";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import Loader from "./Loader";
import { Invoice } from "../interfaces/Invoice";

export function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchInvoice() {
      setIsLoading(true);
      try {
        const data = await getInvoice(id ?? "");
        setInvoice(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false)
      }
    }
    fetchInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <>
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm"
        >
          <Loader />
        </div>
      </>
    )
  }

  return (
    <div className="p-5 bg-gray-50 print:bg-white min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 border border-gray-200 shadow-lg">
        {/* Header */}
        <header className="flex justify-between items-center border-b-2 border-black pb-4">
          <div className="flex items-center space-x-6">
            <img
              src={invoice?.companyId?.image ?? ""}
              alt="Company Logo"
              className="h-24"
            />
            <div>
              <h1 className="text-3xl font-bold">{invoice?.companyId?.fullName}</h1>
              <address className="not-italic text-sm leading-snug mt-1">
                {invoice?.companyId?.address?.address},<br />
                {invoice?.companyId?.address?.city}, {invoice?.companyId?.address?.state} {invoice?.companyId?.address?.pincode}
              </address>
              <p className="text-sm mt-1">Phone: {invoice?.companyId?.phone}</p>
              <p className="text-sm">Email: {invoice?.companyId?.email}</p>
            </div>
          </div>
          <div className="text-left">
            <p className="mb-1">
              <span className="font-semibold">Invoice No.:</span> {invoice?.invoiceNumber}
            </p>
            <p>
              <span className="font-semibold">Invoice Date:</span>{" "}
              {invoice?.createdAt
                ? new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold">Due Date:</span>{" "}
              {invoice?.dueDate
                ? new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
                : "N/A"}
            </p>

          </div>
        </header>

        {/* Bill To */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Bill To</h3>
          <p>{invoice?.customerId?.fullName}</p>
          <p>{invoice?.customerId?.address?.address}</p>
          <p>
            {invoice?.customerId?.address?.city} {invoice?.customerId?.address?.state} {invoice?.customerId?.address?.pincode}
          </p>
          <p>Phone Number: {invoice?.customerId?.phone}</p>
        </section>

        {/* Items Table */}
        <section className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-300">
              <tr>
                {[
                  "S.No",
                  "Items",
                  "H.Sn.",
                  "Qty",
                  "Rate (₹)",
                  "Discount (%)",
                  "Tax (%)",
                  "Amount (₹)",
                ].map((head) => (
                  <th key={head} className="border border-black p-2 text-center font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice?.items?.map((item: any, i: number) => (
                <tr key={item._id ?? i} className="border border-black even:bg-gray-50">
                  <td className="border border-black p-2 text-center">{i + 1}</td>
                  <td className="border border-black p-2 text-center">{item.productId?.name}</td>
                  <td className="border border-black p-2 text-center">{item.hsn}</td>
                  <td className="border border-black p-2 text-center">{item.quantity}</td>
                  <td className="border border-black p-2 text-center">{item.rate}</td>
                  <td className="border border-black p-2 text-center">{item.discount}</td>
                  <td className="border border-black p-2 text-center">{item.taxRate}</td>
                  <td className="border border-black p-2 text-center">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <div className="mt-6 ml-auto w-1/2 text-right space-y-2">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Sub Total Amount:</span>
            <span>₹{invoice?.subTotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Tax Amount:</span>
            <span>₹{invoice?.taxTotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-black pt-2 mt-2">
            <span className="text-xl font-bold">Total Amount:</span>
            <span className="text-xl font-bold">₹{invoice?.total?.toFixed(2)}</span>
          </div>
        </div>

        <div className="clear-both"></div>
        <div>
          {/* Signature and Account Details */}
          <section className="mt-10 flex justify-between items-start">
            <div className="text-left flex items-center">
              <p className="font-semibold">Authorized Signature:</p>
              {invoice?.companyId?.digiImage ? (
                <img
                  src={invoice?.companyId?.digiImage}
                  alt={invoice?.userId?.fullName}
                  className="h-14 mt-2"
                  style={{ mixBlendMode: "multiply" }}
                />) : (<p>{invoice?.userId?.fullName}</p>)}
            </div>

            {/* Uncomment & fill if you want to show account details */}
            {/* <div className="text-left">
            <p className="font-semibold">Account Details:</p>
            <p>Name: AMAN KUMAR JHARIYA</p>
            <p>A/C No.: 1632104000073176</p>
            <p>IFSC: IBKL0001632</p>
          </div> */}
          </section>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-6 flex justify-center print:hidden">
        <Button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Print Invoice
        </Button>
      </div>
    </div>
  );
}
