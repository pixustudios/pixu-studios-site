import { notFound } from "next/navigation";
import BoothEditorPreview from "../components/BoothEditorPreview";
export default function Preview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <BoothEditorPreview />;
}
