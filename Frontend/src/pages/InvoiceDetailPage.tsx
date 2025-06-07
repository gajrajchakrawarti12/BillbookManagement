import { useEffect, useState } from "react";
import { getInvoice } from "../requests/InvoiceRequest";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>();

  useEffect(() => {
    const getDetails = async () => {
      try {
        const invoiceRes = await getInvoice(id ?? "");
        setInvoice(invoiceRes);
      } catch (error) {
        console.log(error);
      }
    };
    getDetails();
  }, [id]);

  return (
    <div>
      <div className="p-5 bg-gray-50 print:bg-white">
        <div className="max-w-6xl mx-auto bg-white p-6 border border-gray-200 shadow-lg ">
          <div className="flex justify-between items-center border-b-2 border-black pb-4">
            <div className="flex items-center">
              <img
                src={invoice?.companyId?.image ?? ""}
                alt="Company Logo"
                className="h-28 pl-5"
              />
            </div>
            <div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold mb-0">
                  {invoice?.companyId?.fullName}
                </h2>
                <p className="text-sm mb-0">
                  {invoice?.companyId?.address?.address},{" "}
                </p>
                <p>
                  {invoice?.companyId?.address?.city},{" "}
                  {invoice?.companyId?.address?.state}{" "}
                  {invoice?.companyId?.address?.pincode}
                </p>
                <p className="text-sm mb-0">
                  Phone: {invoice?.companyId?.phone}
                </p>
                <p className="text-sm mb-0">
                  Email: {invoice?.companyId?.email}
                </p>
              </div>
            </div>

            <div className="text-left">
              <p className="text-lg font-bold mb-0">Invioce</p>
              <div className="relative inline">
                <p className=" mb-0 inline">
                  Bill Number : {invoice?.invoiceNumber}
                </p>
              </div>
              <div className="relative">
                <p className="mb-0 inline">
                  Date :{" "}
                  {invoice?.createdAt
                    ? new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-left">
            <p className="font-bold text-lg mb-0">BILL TO</p>
            <p>{invoice?.customerId?.fullName}</p>
            <p>{invoice?.customerId?.address?.address}</p>
            <p>
              {invoice?.customerId?.address?.city}{" "}
              {invoice?.customerId?.address?.state}{" "}
              {invoice?.customerId?.address?.pincode}
            </p>
            <p className="inline">Phone Number: {invoice?.customerId?.phone}</p>
          </div>

          <table className="w-full mt-6 border-collapse border border-black">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-black p-2">S.No</th>
                <th className="border border-black p-2">Items</th>
                <th className="border border-black p-2">H.Sn.</th>
                <th className="border border-black p-2">Qty</th>
                <th className="border border-black p-2">Rate (₹)</th>
                <th className="border border-black p-2">Discount (%)</th>
                <th className="border border-black p-2">Tax (%)</th>
                <th className="border border-black p-2">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.items.map((row: any, index: number) => (
                <tr key={index} className="border border-black">
                  <td className="border border-black p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {row.productId?.name}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {row.hsn}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {row.quantity}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {row.rate}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {row.discount}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {row.taxRate}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {row.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 text-right">
            <p className="text-lg font-bold mr-4">
              Sub Total Amount: {invoice?.subTotal}
            </p>
            <p className="text-lg font-bold mr-4">
              Tax Amount: {invoice?.taxTotal}
            </p>
            <p className="text-lg font-bold mr-4">
              Total Amount: {invoice?.total}
            </p>
          </div>

          <div className="mt-6 flex justify-between text-left">
            {invoice?.companyId?.digiImage && (
              <div>
                <p className="font-semibold">
                  Sign By: <br /> {invoice?.userId?.fullName}
                </p>
                <img
                  src={invoice?.companyId?.digiImage}
                  alt="Signature"
                  className="h-12 mt-2 mix-blend-darken"
                />
              </div>
            )}
            {/* <div className="text-left">
              <p className="font-semibold">Account Details:</p>
              <p>Name: AMAN KUMAR JHARIYA</p>
              <p>A/C No.: 1632104000073176</p>
              <p>IFSC: IBKL0001632</p>
            </div> */}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center print:hidden">
        <Button
          onClick={() => window.print()}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Print Invoice
        </Button>
      </div>
    </div>
  );
}
