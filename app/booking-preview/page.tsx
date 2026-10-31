import { notFound } from "next/navigation";
import EnquirySuccess from "../components/EnquirySuccess";
export default function Preview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <main id="main" className="pixu-modern" style={{padding: "70px 24px", maxWidth: 800, marginInline: "auto"}}><EnquirySuccess /></main>;
}
