import { LiveConsultationScreen } from "@/modules/consultation/ui/live-consultation-screen";

export default async function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LiveConsultationScreen consultationId={id} patientName="Paciente de demonstração" />;
}
